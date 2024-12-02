const Comment = require("../models/comment.model"); // Ensure the correct path
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
let Validator = require("validatorjs");

exports.addComment = catchAsyncErrors(async (req, res, next) => {
  const { desc, postid, userid ,...rest } = req.body;
  const other = Object.keys(rest);
  other.map((e) => {
    return next(
      new ErrorHandler(
        `Please remove unwanted fields ${e} from request body`,
        400
      )
    );
  });

  let validation = new Validator(req.body, {
    desc: "required",
    postid: "required",
    userid:  "required",
  });

  let errObj = null;
  validation.checkAsync(null, () => {
    errObj = validation.errors.all();
    for (const errProp in errObj) {
      return next(new ErrorHandler(errObj[errProp], 400));
    }
  });


  if (!errObj) {
    const comment = {
      desc,
      userid,
      postid,
    };
  const commentCreate = await Comment.create(comment);

  res.status(201).json({
    success: true,
    message: "Comment has been added!",
    data: commentCreate,
  });
}
});


exports.getComment = catchAsyncErrors(async (req, res, next)=> {

    const postid = req.params.postid
  
    const comment_data = await Comment.getCommentById(postid);
    if(!comment_data){
      return next(new ErrorHandler(`The entered post ID is invalid`, 400))
    }
    const cleanedData = comment_data.map((comment) => {
        const { userId, ...rest } = comment; // Destructure and exclude `userId`
        return rest;
      });
    res.status(200).json({
      status: true,
      data: cleanedData
    })
  })
  