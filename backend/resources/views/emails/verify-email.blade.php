<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Verifica tu correo</title>
</head>
<body>
    <p>Hola {{ $user->nombre ?? $user->email }},</p>

    <p>Gracias por registrarte. Por favor, verifica tu correo haciendo clic en el siguiente enlace:</p>

    <p>
        <a href="{{ $verificationUrl }}" target="_blank">
            Verificar correo
        </a>
    </p>

    <p>Si tú no creaste esta cuenta, puedes ignorar este mensaje.</p>

    <p>Un saludo y bienvenido a {{ config('app.name') }}!</p>
</body>
</html>