<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Invalid request method."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['name'], $data['phone'], $data['completeAddress'], $data['services'])) {
    http_response_code(400);
    echo json_encode(["message" => "Missing required fields."]);
    exit;
}

// Assign fields
$name            = $conn->real_escape_string($data['name']);
$phone           = $conn->real_escape_string($data['phone']);
$email           = isset($data['email']) ? $conn->real_escape_string($data['email']) : "";
$completeAddress = $conn->real_escape_string($data['completeAddress']);
$street          = isset($data['street']) ? $conn->real_escape_string($data['street']) : "";
$houseNo         = isset($data['houseNo']) ? $conn->real_escape_string($data['houseNo']) : "";
$apartmentNo     = isset($data['apartmentNo']) ? $conn->real_escape_string($data['apartmentNo']) : "";
$servicesArray   = $data['services'];
$acTypes         = isset($data['acTypes']) ? $data['acTypes'] : [];

// Begin transaction
$conn->begin_transaction();

try {
    // Insert into bookings table (without JSON columns)
    $stmt = $conn->prepare("INSERT INTO bookings (name, phone, email, complete_address, street, house_no, apartment_no) VALUES (?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("sssssss", $name, $phone, $email, $completeAddress, $street, $houseNo, $apartmentNo);
    if (!$stmt->execute()) {
        throw new Exception("Booking insertion failed: " . $stmt->error);
    }
    $bookingId = $conn->insert_id;
    $stmt->close();

    // For each service, verify availability and insert into booking_services
    foreach ($servicesArray as $service) {
        if (!isset($service['type'], $service['date'])) {
            throw new Exception("Each service must include a type and a date.");
        }
        $serviceType = $conn->real_escape_string($service['type']);
        $appointmentDate = $conn->real_escape_string($service['date']);

        // Check if this date already has 2 or more bookings for this service
        $query = "SELECT COUNT(*) as count FROM booking_services 
                  WHERE appointment_date = '$appointmentDate' AND service_type = '$serviceType'";
        $result = $conn->query($query);
        if (!$result) {
            throw new Exception("Error checking appointment availability: " . $conn->error);
        }
        $row = $result->fetch_assoc();
        if ($row['count'] >= 2) {
            throw new Exception("The date $appointmentDate for service $serviceType is fully booked.");
        }
        $result->free();

        // Insert into booking_services
        $stmtService = $conn->prepare("INSERT INTO booking_services (booking_id, service_type, appointment_date) VALUES (?, ?, ?)");
        if (!$stmtService) {
            throw new Exception("Prepare for service insertion failed: " . $conn->error);
        }
        $stmtService->bind_param("iss", $bookingId, $serviceType, $appointmentDate);
        if (!$stmtService->execute()) {
            throw new Exception("Service appointment insertion failed: " . $stmtService->error);
        }
        $stmtService->close();
    }

    // For each AC type, insert into booking_actypes
    foreach ($acTypes as $acType) {
        $acType = $conn->real_escape_string($acType);
        $stmtAcType = $conn->prepare("INSERT INTO booking_actypes (booking_id, ac_type) VALUES (?, ?)");
        if (!$stmtAcType) {
            throw new Exception("Prepare for AC type insertion failed: " . $conn->error);
        }
        $stmtAcType->bind_param("is", $bookingId, $acType);
        if (!$stmtAcType->execute()) {
            throw new Exception("AC type insertion failed: " . $stmtAcType->error);
        }
        $stmtAcType->close();
    }

    $conn->commit();
    echo json_encode(["message" => "Booking saved successfully", "bookingId" => $bookingId]);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["message" => "Error saving booking", "error" => $e->getMessage()]);
}

$conn->close();
?>
