module.exports = (err, req, res, next) => {
  console.log(err);
  if (err) {
    return res.status(500).json({
      message: "There was an error performing the required operation",
      validation: [],
      data: {},
    });
  }
};
