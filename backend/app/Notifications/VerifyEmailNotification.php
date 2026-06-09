<?php

namespace App\Notifications;

use App\Mail\VerifyEmail;
use Illuminate\Notifications\Notification;

class VerifyEmailNotification extends Notification
{

    public function __construct()
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): VerifyEmail
    {
        return new VerifyEmail($notifiable);
    }
}
