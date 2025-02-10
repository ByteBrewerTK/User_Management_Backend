const welcomeEmailTemplate = (name, email, password) => {
	return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Aegix</title>
        <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; font-family: Arial, sans-serif; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
        .header { text-align: center; padding: 20px; background-color: #333; color: #ffffff; border-radius: 10px 10px 0 0; }
        .content { padding: 20px; text-align: center; }
        a { color: #ffffff; text-decoration: none; }
        .footer { text-align: center; padding: 10px; background-color: #333; color: #ffffff; border-radius: 0 0 10px 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Aegix</h1>
            </div>
            <div class="content">
                <p>Hi ${name},</p>
                <p>Welcome to Aegix! We are excited to have you onboard.</p>
                <p>Your account has been created by an administrator.</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p>Please keep this information secure. If you have any issues, feel free to contact support.</p>
            </div>
            <div class="footer">
                <p>Aegix | <a href="mailto:support.aegix@bytebrewer.site">support.aegix@bytebrewer.site</a></p>
            </div>
        </div>
    </body>
    </html>
  `;
};

export default welcomeEmailTemplate;
