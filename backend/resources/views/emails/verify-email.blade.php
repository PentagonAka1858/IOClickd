<x-mail::message>
# Verify Email Address

Hi {{ $user->nombre }},

Please click the button below to verify your email address:

<x-mail::button :url="$verificationUrl">
Verify Email
</x-mail::button>

This verification link will expire in 24 hours.

If you didn't create this account, please ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
