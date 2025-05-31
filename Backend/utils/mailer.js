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


function styleEmailHtml(html) {
  // Bold all badges
  let out = html.replace(/<span[^>]*data-type="[^"]*"[^>]*>(.*?)<\/span>/g, '<strong>$1</strong>');
  // Style <mark> or <mark ...> for highlight, replace with <span>
  out = out.replace(/<mark[^>]*>(.*?)<\/mark>/g, '<span style="background: #fff3a3; color: #000; padding: 0 2px; border-radius: 2px;">$1</span>');
  // Style <code> for code
  out = out.replace(/<code>(.*?)<\/code>/g, '<code style="background: #22223b; color: #fff; padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>');
  return out;
}

function subjectToPlainText(html) {
  // Replace badge spans with their text content
  let out = html.replace(/<span[^>]*data-type="[^"]*"[^>]*>(.*?)<\/span>/g, '$1');
  // Remove all other HTML tags
  out = out.replace(/<[^>]+>/g, '');
  // Optionally, decode HTML entities if needed
  return out.trim();
}

async function sendRubricPDF(to, studentName, rubricName, pdfBuffer, subject, body) {
  const formattedBody = styleEmailHtml(body);
  const formattedSubject = subjectToPlainText(subject);

  await transporter.sendMail({
    from: "Soporte Rubricas <rubritm@gmail.com>",
    to,
    subject: formattedSubject,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background-color: #fafafa; border: 1px solid #d3d3d3; border-radius: 10px; overflow: hidden;">
        <!-- Header -->
        <div style="background-color: #2a3465; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${formattedSubject || 'Rúbrica de Calificación'}</h1>
        </div>

        <!-- Body -->
        <div style="padding: 30px; color: #2a3465;">
          ${formattedBody}
        </div>

        <hr style="margin: 30px 0; border-color: #d3d3d3;">

        <p style="font-size: 13px; color: #545250; text-align: center; padding-bottom: 20px;">
          Este es un mensaje automático, por favor no respondas a este correo.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `${rubricName}-${studentName}.pdf`,
        content: pdfBuffer
      }
    ]
  });
}

module.exports = { sendCodeEmail, sendPasswordChangeCode, sendRubricPDF };
