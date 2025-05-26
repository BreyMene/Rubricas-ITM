const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "rubritm@gmail.com",
      pass: "nvno imty vudb qrys",
      // password account is RItm123456
    },
});


async function sendCodeEmail(to, code) {
    await transporter.sendMail({
        from: "Soporte Rubricas <rubritm@gmail.com>",
        to,
        subject: "Código de recuperación de cuenta",
        text: `Tu código de recuperación es: ${code}`,
        html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">Recuperación de cuenta</h2>
                    <p>Hemos recibido una solicitud para recuperar tu cuenta.</p>
                    <p style="font-size: 18px; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                        Tu código de verificación es: <strong>${code}</strong>
                    </p>
                    <p>Este código expirará en 15 minutos.</p>
                    <p style="font-size: 12px; color: #7f8c8d;">
                        Si no solicitaste este código, por favor ignora este mensaje.
                    </p>
                </div>
            `,
            headers: {
                "X-Priority": "1", // High importance
                "X-Mailer": "Nodemailer",
                "X-MSMail-Priority": "High",
                "Importance": "High"
            },
    });
}

module.exports = { sendCodeEmail };
