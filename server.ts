import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // OTP Store (Email -> { code, expires })
  const otpStore = new Map<string, { code: string; expires: number }>();

  // Nodemailer configuration
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // API Route to send OTP
  app.post("/api/send-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email là bắt buộc" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(email, { code: otp, expires });

    console.log(`Sending OTP ${otp} to ${email}`);

    try {
      await transporter.sendMail({
        from: `"LQD Future" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Mã xác minh LQD Future",
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4f46e5;">Xác minh tài khoản LQD Future</h2>
            <p>Chào bạn,</p>
            <p>Mã xác minh (OTP) của bạn là:</p>
            <div style="background: #f3f4f6; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p>Mã này có hiệu lực trong vòng <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 0.8em; color: #888;">Đây là email tự động, vui lòng không phản hồi.</p>
          </div>
        `,
      });

      res.json({ success: true, message: "Mã OTP đã được gửi" });
    } catch (error) {
      console.error("Nodemailer Error:", error);
      res.status(500).json({ error: "Không thể gửi email. Vui lòng kiểm tra cấu hình GMAIL_USER và GMAIL_APP_PASSWORD." });
    }
  });

  // API Route to verify OTP
  app.post("/api/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email và OTP là bắt buộc" });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ error: "Không tìm thấy mã xác minh cho email này" });
    }

    if (Date.now() > storedData.expires) {
      otpStore.delete(email);
      return res.status(400).json({ error: "Mã xác minh đã hết hạn" });
    }

    if (storedData.code !== otp) {
      return res.status(400).json({ error: "Mã xác minh không chính xác" });
    }

    // Success - clean up
    otpStore.delete(email);
    res.json({ success: true, message: "Xác minh thành công" });
  });

  // API Route to send PDF via email
  app.post("/api/send-pdf-email", async (req, res) => {
    const { email, pdfBase64 } = req.body;

    if (!email || !pdfBase64) {
      return res.status(400).json({ error: "Email và PDF data là bắt buộc" });
    }

    try {
      // Remove the data URL prefix if present
      const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");

      await transporter.sendMail({
        from: `"LQD Future" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Báo cáo Định hướng Nghề nghiệp - LQD Future",
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <p>Chào bạn, đây là báo cáo chi tiết từ LQD Future mà bạn vừa tải xuống. Chúc bạn thành công!</p>
          </div>
        `,
        attachments: [
          {
            filename: "Bao_cao_LQD_Future.pdf",
            content: base64Data,
            encoding: "base64",
          },
        ],
      });

      res.json({ success: true, message: "PDF đã được gửi qua email" });
    } catch (error) {
      console.error("Nodemailer Error (PDF):", error);
      res.status(500).json({ error: "Không thể gửi email đính kèm PDF." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
