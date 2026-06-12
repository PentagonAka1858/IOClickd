<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Verifica tu correo</title>
    <style>
        body {
            font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
            background-color: #f8f9fa;
            color: #121314;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #f0f4f5;
            padding: 30px;
            border: 3px solid #121314;
            border-radius: 0px;
            box-shadow: 8px 8px 0 #121314;
        }
        h1 {
            color: #121314;
            font-size: 24px;
            font-weight: 900;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        p {
            line-height: 1.5;
            margin-bottom: 15px;
            font-weight: 500;
        }
        .button {
            display: inline-block;
            background-color: #F8F65E;
            color: #121314 !important;
            text-decoration: none;
            padding: 12px 24px;
            border: 2px solid #121314;
            box-shadow: 4px 4px 0 #121314;
            font-weight: 700;
            margin-top: 15px;
            margin-bottom: 15px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .button:hover {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0 #121314;
        }
        .footer {
            margin-top: 30px;
            font-size: 0.9em;
            color: #121314;
            border-top: 3px solid #121314;
            padding-top: 20px;
            font-weight: 500;
        }
        .url-fallback {
            word-break: break-all;
            color: #121314;
            background-color: #f8f9fa;
            padding: 10px;
            border: 2px solid #121314;
            box-shadow: 4px 4px 0 #121314;
            margin-top: 10px;
            display: block;
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Verifica tu correo</h1>
        <p>Hola {{ $user->nombre ?? $user->email }},</p>

        <p>Gracias por registrarte. Por favor, verifica tu correo haciendo clic en el siguiente enlace:</p>

        <p style="text-align: center;">
            <a href="{{ $verificationUrl }}" target="_blank" class="button">
                Verificar correo
            </a>
        </p>

        <p>Si tú no creaste esta cuenta, puedes ignorar este mensaje.</p>

        <div class="footer">
            <p>Si tienes problemas para hacer clic en el botón "Verificar correo", copia y pega la siguiente URL en tu navegador web:</p>
            <span class="url-fallback">{{ $verificationUrl }}</span>
            <br>
            <p>Un saludo y bienvenido a {{ config('app.name') }}!</p>
        </div>
    </div>
</body>
</html>