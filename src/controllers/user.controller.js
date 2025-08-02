import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import validator from "validator";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refressToken = await user.generateRefreshToken();

    user.refressToken = refressToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refressToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong white generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;

  if (
    [username, email, password, fullname].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  } // we can also validate email with correct order... w'll do later

  if (!validator.isEmail(email)) {
    throw new ApiError(300, "Please enter gmail in correct order");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // check file uploaded on local
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files.coverImage[0].path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload local file on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // check avatar successfull uploaded on cloud

  if (!avatar) {
    throw new ApiError(400, "Avatar file is reuired");
  }

  const user = await User.create({
    fullname,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // check if user register, get that user in res, remove password and refreshtoke of that user

  const createdUser = await User.findById(user._id).select(
    "-password -refressToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Someting went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User register successfully"));
});

// login API
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
console.log("email", email);

  if (!(email || username)) {
    throw new ApiError(400, "Email or username is required");
  }

  const user = await User.findOne({
    $or: [{ email, username }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exit");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user crendential");
  }

  const { accessToken, refressToken } = await generateAccessAndRefereshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refressToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refressToken", refressToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refressToken },
        "User loggedIn successfully"
      )
    );
});

// logout API
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refressToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refressToken", options)
    .json(new ApiResponse(200, {}, "User logged Out successfull"));
});

//matching refreshToken from db to user token expire - API

const refreshAccessToke = asyncHandler(async (req, res) => {
  const incommingToken = req.cookies.refressToken || req.body.accessToken;
  
  if (!incommingToken) {
    throw new ApiError(401, "Unauthorized token");
  }
  try {
    const descodedToken = jwt.verify(
      incommingToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  
    const user = await User.findById(descodedToken._id).select(
      "-password"
    );
    
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
  
    if (incommingToken !== user?.refressToken) {
      throw new ApiError(401, "Refress token expire or used");
    }
  
    const option = {
      httpOnly: true,
      secure: true,
    };
  
    const { accessToken, newrefereshToken } = await generateAccessAndRefereshToken(
      user._id
    );
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refressToken", newrefereshToken, option)
      .json(
        new ApiResponse(
          200,
          { accessToken, refereshToken:newrefereshToken },
          "Access token refressed"
        )
      );
  } catch (error) {
    throw new ApiError(401, "invalid refress token")
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToke };
