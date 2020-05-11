const express = require("express");
const controller = require("../controllers/message.controller");
const { authorize } = require("../middlewares/auth");
const validate = require("../validations/message.validation");

const router = express.Router();

router
  .route("/list")
  /**
   * @api {get} /messages List Messages
   * @apiDescription Get a list of Messages
   * @apiVersion 1.0.0
   * @apiName ListMessages
   * @apiGroup Message
   * @apiPermission admin
   *
   * @apiHeader {String} Athorization  User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Users per page
   * @apiParam  {String}             [name]       User's name
   * @apiParam  {String}             [email]      User's email
   * @apiParam  {String=user,admin}  [role]       User's role
   *
   * @apiSuccess {Object[]} users List of users.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(validate.authorization, authorize(), controller.list);

router
  .route("/list/page/:pageNum")
  .get(validate.authorization, authorize(), controller.list);

router
  .route("/create")
  .post(
    validate.authorization,
    validate.createMessage,
    authorize(),
    controller.create
  );

module.exports = router;
