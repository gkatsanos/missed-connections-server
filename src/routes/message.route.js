const express = require("express");
const controller = require("../controllers/message.controller");
const { authorize } = require("../middlewares/auth");
const validate = require("../validations/message.validation");
const router = express.Router();

/**
 * @api {get} /messages/list/:page List Messages Paginated
 * @apiDescription Get a list of Paginated Messages
 * @apiVersion 1.0.0
 * @apiName ListMessagesPaginated
 * @apiGroup Message
 * @apiPermission user
 *
 * @apiHeader {String} Cookie  Cookie with access token
 *
 * @apiParam  {Number{1-}} page List page
 *
 * @apiSuccess {Object[]} messages List of messages.
 *
 * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
 * @apiError (Unprocessable Entity 422) Unprocessable Entity Badly formed request or missing required header or body param
 */
router
  .route("/list/:page")
  .get(validate.authorization, authorize(), controller.list);

router
  .route("/:id")
  .get(validate.authorization, authorize(), controller.getMessage);

router
  .route("/create")
  .post(
    validate.authorization,
    validate.createMessage,
    authorize(),
    controller.create
  );

module.exports = router;
