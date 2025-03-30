<?php
// sendEmailNotification.php

// Add CORS headers so requests from your frontend (e.g., localhost:5173) are allowed
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Adjust the path if needed

// Read JSON input from the request body
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields (email must be present and valid)
if (!isset($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid or missing email address."]);
    exit;
}

$email = $data['email'];
$appointmentId = isset($data['appointmentId']) ? $data['appointmentId'] : '';
$name = isset($data['name']) ? $data['name'] : '';
$messageText = isset($data['message']) ? $data['message'] : "Your appointment has been accepted.";

// Create a new PHPMailer instance
$mail = new PHPMailer(true);

try {
    
$mail->isSMTP();
$mail->Host = 'smtp.gmail.com';
$mail->SMTPAuth = true;
$mail->Username = 'plonteras.johnkristoffer@gmail.com';      // Your Gmail address
$mail->Password = 'yzrcrwcghzhoxicv';         // Your generated App Password
$mail->SMTPSecure = 'tls';                     // or 'ssl' if using port 465
$mail->Port = 587;                             // 587 for TLS, 465 for SSL

    $mail->setFrom('plonteras.johnkristoffer@gmail.com', 'Your Service Team');
    
    // Add a recipient
    $mail->addAddress($email, $name);

    // Set email format to plain text (or HTML if you prefer)
    $mail->isHTML(false);

    // Email subject and body
    $mail->Subject = "Appointment Confirmation (ID: $appointmentId)";
    $mail->Body    = "Hello $name,\n\nYour appointment (ID: $appointmentId) has been accepted.\n\n$messageText\n\nThank you,\nYour Service Team";

    // Attempt to send the email
    if ($mail->send()) {
        echo json_encode(["message" => "Email sent successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to send email"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Mailer Error: " . $mail->ErrorInfo]);
}
?>
