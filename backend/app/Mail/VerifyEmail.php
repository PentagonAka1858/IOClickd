<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerifyEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public User $user)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Verify Email Address',
        );
    }

    public function content(): Content
    {
        // Generate the verification URL that points to the frontend
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $verificationUrl = $frontendUrl . '/verify-email?id=' . $this->user->id . '&hash=' . sha1($this->user->email);

        return new Content(
            view: 'emails.verify-email',
            with: [
                'user' => $this->user,
                'verificationUrl' => $verificationUrl,
            ],
        );
    }
}
