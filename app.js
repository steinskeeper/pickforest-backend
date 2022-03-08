var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')



var authRouter = require('./api/auth')
var userRouter = require('./api/user')
var bucketRouter = require('./api/bucket')
var photosRouter = require('./api/photos')

var app = express();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/picktestnew').
  catch(error => handleError(error));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', 'https://pickforest.me'],
}))



app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/bucket', bucketRouter)
app.use('/api/photos', photosRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json('error');
});
module.exports = app