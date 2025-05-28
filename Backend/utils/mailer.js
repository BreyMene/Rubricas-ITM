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
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background-color: #fafafa; border: 1px solid #d3d3d3; border-radius: 10px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #2a3465; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Recuperación de Cuenta</h1>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #2a3465;">Hola,</p>
          <p style="font-size: 15px; color: #2a3465; line-height: 1.5;">
            Hemos recibido una solicitud para recuperar tu cuenta de <strong>Rúbricas ITM</strong>.
          </p>

          <p style="font-size: 15px; margin-top: 30px; text-align: center; color: #523a72;">
            Tu código de verificación es:
          </p>

          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; background-color: #f3f4f6; padding: 12px 24px; border-radius: 8px; letter-spacing: 2px; color: #4e5ea3;">
              ${code}
            </span>
          </div>

          <p style="font-size: 14px; text-align: center; color: #807467;">
            Este código expirará en 10 minutos.
          </p>

          <hr style="margin: 30px 0; border-color: #d3d3d3;">

          <p style="font-size: 13px; color: #545250; text-align: center;">
            Si no solicitaste este código, puedes ignorar este mensaje.
          </p>
        </div>
      </div>
    `,
  });
}

async function sendPasswordChangeCode(to, code) {
  await transporter.sendMail({
    from: "Soporte Rubricas <rubritm@gmail.com>",
    to,
    subject: "Código de verificación para cambio de contraseña",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background-color: #fafafa; border: 1px solid #d3d3d3; border-radius: 10px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #2a3465; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Cambio de Contraseña</h1>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #2a3465;">Hola,</p>
          <p style="font-size: 15px; color: #2a3465; line-height: 1.5;">
            Hemos recibido una solicitud para cambiar la contraseña de tu cuenta en <strong>Rúbricas ITM</strong>.
          </p>

          <p style="font-size: 15px; margin-top: 30px; text-align: center; color: #523a72;">
            Tu código de verificación es:
          </p>

          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; background-color: #f3f4f6; padding: 12px 24px; border-radius: 8px; letter-spacing: 2px; color: #4e5ea3;">
              ${code}
            </span>
          </div>

          <p style="font-size: 14px; text-align: center; color: #807467;">
            Este código expirará en 10 minutos.
          </p>

          <hr style="margin: 30px 0; border-color: #d3d3d3;">

          <p style="font-size: 13px; color: #545250; text-align: center;">
            Si no solicitaste este cambio de contraseña, por favor contacta a soporte inmediatamente.
          </p>
        </div>
      </div>
    `,
  });
}

module.exports = { sendCodeEmail, sendPasswordChangeCode };
