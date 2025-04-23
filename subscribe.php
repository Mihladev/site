<?php
// Return JSON response
header('Content-Type: application/json');

// Enable error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include PHPMailer
require_once 'PHPMailer-master/src/PHPMailer.php';
require_once 'PHPMailer-master/src/SMTP.php';
require_once 'PHPMailer-master/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Allow only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
    exit;
}

// Validate and sanitize email
if (!isset($_POST['email']) || !filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid email address']);
    exit;
}

$email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);

// Set recipient
$to = 'info@blaqtronics.co.za';

// Create PHPMailer instance
$mail = new PHPMailer(true);

try {
    // SMTP settings for Afrihost
    $mail->isSMTP();
    $mail->Host       = 'mail.blaqtronics.co.za'; // Replace with your domain mail server
    $mail->SMTPAuth   = true;
    $mail->Username   = 'info@blaqtronics.co.za'; // Your domain email
    $mail->Password   = 'your_email_password';    // Your domain email password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // Set sender and recipient
    $mail->setFrom('noreply@blaqtronics.co.za', 'Blaqtronics Newsletter');
    $mail->addAddress($to);

    // Email content
    $mail->isHTML(true);
    $mail->Subject = 'New Newsletter Subscription';
    $mail->Body    = "A new subscriber has joined your mailing list:<br><br><strong>Email:</strong> $email";

    // Send email
    $mail->send();

    http_response_code(200);
    echo json_encode(['status' => 'success', 'message' => 'Thank you for subscribing!']);
} catch (Exception $e) {
    error_log("Subscribe error: " . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to subscribe. Please try again later.']);
}
?>
