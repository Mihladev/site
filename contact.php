<?php
// Always return JSON
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check for PHPMailer files
if (!file_exists('PHPMailer-master/src/Exception.php')) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'PHPMailer not found']);
    exit;
}

require_once 'PHPMailer-master/src/PHPMailer.php';
require_once 'PHPMailer-master/src/SMTP.php';
require_once 'PHPMailer-master/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Get form data
$name    = isset($_POST['name']) ? htmlspecialchars(trim($_POST['name'])) : '';
$email   = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$service = isset($_POST['service']) ? htmlspecialchars(trim($_POST['service'])) : '';
$message = isset($_POST['message']) ? htmlspecialchars(trim($_POST['message'])) : '';
$phone   = isset($_POST['phone']) ? htmlspecialchars(trim($_POST['phone'])) : '';
$project = isset($_POST['project']) ? htmlspecialchars(trim($_POST['project'])) : '';
$dates   = isset($_POST['dates']) ? htmlspecialchars(trim($_POST['dates'])) : '';

// Validate required fields
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Please fill all required fields']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid email format']);
    exit;
}

// Build email body
$body = "<strong>Name:</strong> $name<br>";
$body .= "<strong>Email:</strong> $email<br>";
if (!empty($phone)) $body .= "<strong>Phone:</strong> $phone<br>";
if (!empty($project)) $body .= "<strong>Project Location:</strong> $project<br>";
if (!empty($dates)) $body .= "<strong>Rental Period:</strong> $dates<br>";
$body .= "<strong>Service/Department:</strong> $service<br><br>";
$body .= "<strong>Message:</strong><br>$message";

$mail = new PHPMailer(true);

try {
    // SMTP config for Afrihost
    $mail->isSMTP();
    $mail->Host       = 'mail.blaqtronics.co.za'; // or your domain mail server
    $mail->SMTPAuth   = true;
    $mail->Username   = 'info@blaqtronics.co.za'; // Your domain email
    $mail->Password   = 'your_email_password';    // Replace with your email password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Try also PHPMailer::ENCRYPTION_SMTPS if STARTTLS fails
    $mail->Port       = 587; // Port for TLS

    // Sender/recipient
    $mail->setFrom('info@blaqtronics.co.za', 'Blaqtronics Website');
    $mail->addAddress('info@blaqtronics.co.za'); // Where messages should go

    // Email content
    $mail->isHTML(true);
    $mail->Subject = "Contact Form: $service inquiry from $name";
    $mail->Body    = $body;

    $mail->send();

    http_response_code(200);
    echo json_encode(['status' => 'success', 'message' => 'Your message has been sent!']);
} catch (Exception $e) {
    error_log("Mailer Error: " . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to send. Please try again later.']);
}
?>
