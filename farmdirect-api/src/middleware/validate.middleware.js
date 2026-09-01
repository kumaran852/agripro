import { AppError } from "../utils/AppError.js";

export function validate(schema) {
  return (req, _res, next) => {
    try {
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (!result.success) {
        const msg = result.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ");
        return next(new AppError(msg, 400, "VALIDATION_ERROR"));
      }
      req.validated = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}
