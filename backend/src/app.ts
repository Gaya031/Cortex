import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from "./routes.js";

const app = express();

// app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use(
  cors({
    origin: "https://cortex-code.vercel.app",
    credentials: true,
  }),
);

app.get("/health-check", (req, res) => {
    res.status(200).json({
        success: true,
        message: "server healthy"
    })
})

app.use("/api", routes);

export default app;
