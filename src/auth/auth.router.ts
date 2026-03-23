import { Express } from "express";
import {
  registerCustomerController,
  getCustomerByIdController,
  getCustomerController,
  updateCustomerController,
  loginCustomerController,
  deleteCustomerController,
  verifyCustomerController,
  getFarmersController,
  getAdminsController,
} from "./auth.controller";

import { adminRoleAuth, bothRoleAuth } from "../middleware/bearAuth";
import { uploadProfileImage } from "../config/upload.config"; // ✅ Import multer middleware

const customer = (app: Express) => {
  // Authentication routes (public)
  app.route("/auth/register").post(async (req, res, next) => {
    try {
      await registerCustomerController(req, res);
    } catch (error) {
      next(error);
    }
  });

  app.route("/auth/login").post(async (req, res, next) => {
    try {
      await loginCustomerController(req, res);
    } catch (error) {
      next(error);
    }
  });

  app.route("/auth/verify").post(async (req, res, next) => {
    try {
      await verifyCustomerController(req, res);
    } catch (error) {
      next(error);
    }
  });

  // Get all customers (admins and farmers) - Admin only
  app.route("/customers").get(
    // adminRoleAuth,
    async (req, res, next) => {
      try {
        await getCustomerController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Get all farmers only - Admin only
  app.route("/farmers").get(
    // adminRoleAuth,
    async (req, res, next) => {
      try {
        await getFarmersController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Get all admins/collectors only - Admin only
  app.route("/admins").get(
    // adminRoleAuth,
    async (req, res, next) => {
      try {
        await getAdminsController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Get customer by ID - Both admin and user can access
  app.route("/customer/:id").get(
    // bothRoleAuth,
    async (req, res, next) => {
      try {
        await getCustomerByIdController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // ✅ FIXED: Update customer by ID - multer middleware added to handle image upload
  app.route("/customer/:id").put(
    // bothRoleAuth,
    uploadProfileImage, // ✅ This processes multipart/form-data and populates req.file
    async (req, res, next) => {
      try {
        await updateCustomerController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );

  // Delete customer by ID - Admin only
  app.route("/customer/:id").delete(
    // adminRoleAuth,
    async (req, res, next) => {
      try {
        await deleteCustomerController(req, res);
      } catch (error: any) {
        next(error);
      }
    },
  );
};

export default customer;
