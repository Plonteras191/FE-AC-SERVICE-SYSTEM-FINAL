<?php
// appointments.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require '../database.php'; // Adjust the path if needed

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

// Handle preflight OPTIONS request
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/**
 * Helper function to fetch services and distribute AC types for a given booking.
 * It fetches services (from booking_services) and AC types (from booking_actypes)
 * in insertion order, and then splits the AC types array among the services.
 */
function getServicesWithAcTypes($conn, $bookingId) {
    // Fetch services ordered by their id.
    $servicesArray = [];
    $sqlServices = "SELECT id, service_type, appointment_date FROM booking_services WHERE booking_id = $bookingId ORDER BY id ASC";
    $resultServices = $conn->query($sqlServices);
    if ($resultServices && $resultServices->num_rows > 0) {
        while ($sRow = $resultServices->fetch_assoc()) {
            $servicesArray[] = [
                'service_id' => $sRow['id'],
                'type' => $sRow['service_type'],
                'date' => $sRow['appointment_date'],
                'ac_types' => []  // to be filled later
            ];
        }
    }
    
    // Fetch AC types ordered by their id.
    $acTypes = [];
    $sqlActypes = "SELECT ac_type FROM booking_actypes WHERE booking_id = $bookingId ORDER BY id ASC";
    $resultActypes = $conn->query($sqlActypes);
    if ($resultActypes && $resultActypes->num_rows > 0) {
        while ($aRow = $resultActypes->fetch_assoc()) {
            $acTypes[] = $aRow['ac_type'];
        }
    }
    
    $totalServices = count($servicesArray);
    $totalAcTypes = count($acTypes);
    
    if ($totalServices > 0 && $totalAcTypes > 0) {
        // Calculate base number of ac types per service and the remainder
        $baseCount = floor($totalAcTypes / $totalServices);
        $remainder = $totalAcTypes % $totalServices;
        $acIndex = 0;
        // Distribute ac types among services
        for ($i = 0; $i < $totalServices; $i++) {
            // Each service gets baseCount AC types, and if remainder > 0, one extra.
            $countForThisService = $baseCount + ($remainder > 0 ? 1 : 0);
            if ($remainder > 0) {
                $remainder--;
            }
            $servicesArray[$i]['ac_types'] = array_slice($acTypes, $acIndex, $countForThisService);
            $acIndex += $countForThisService;
        }
    }
    
    return $servicesArray;
}

if ($method === 'GET') {
    // Fetch all appointments
    $sql = "SELECT * FROM bookings";
    $result = $conn->query($sql);
    if (!$result) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $conn->error]);
        exit;
    }
    
    $appointments = [];
    while ($row = $result->fetch_assoc()) {
        // Get services along with their distributed AC types.
        $servicesArray = getServicesWithAcTypes($conn, $row['id']);
        $row['services'] = json_encode($servicesArray);
        $appointments[] = $row;
    }
    
    echo json_encode($appointments);
    exit;
}

// POST branch for accepting or completing an appointment
elseif ($method === 'POST' && isset($_GET['action']) && in_array($_GET['action'], ['accept', 'complete']) && $id) {
    $action = $_GET['action'];
    if ($action === 'accept') {
        $status = 'accepted';
    } elseif ($action === 'complete') {
        $status = 'completed';
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid action"]);
        exit;
    }
    
    $sql = "UPDATE bookings SET status='$status' WHERE id=$id";
    if ($conn->query($sql)) {
        // Fetch the updated appointment
        $sql = "SELECT * FROM bookings WHERE id = $id";
        $result = $conn->query($sql);
        if ($result && $result->num_rows > 0) {
            $updatedAppointment = $result->fetch_assoc();
            $servicesArray = getServicesWithAcTypes($conn, $id);
            $updatedAppointment['services'] = json_encode($servicesArray);
            echo json_encode($updatedAppointment);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to retrieve updated appointment: " . $conn->error]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to update appointment: " . $conn->error]);
    }
    exit;
}

elseif ($method === 'PUT' && isset($_GET['action']) && $_GET['action'] === 'reschedule' && $id) {
    // Reschedule a service within an appointment
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['service_name']) || !isset($data['new_date'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing service_name or new_date"]);
        exit;
    }
    
    $serviceName = $conn->real_escape_string($data['service_name']);
    $newDate = $conn->real_escape_string($data['new_date']);
    
    // Update the booking_services table
    $sql = "UPDATE booking_services 
            SET appointment_date = '$newDate' 
            WHERE booking_id = $id AND service_type = '$serviceName'";
    
    if ($conn->query($sql)) {
        // Return the updated appointment with its services and distributed AC types.
        $sql = "SELECT * FROM bookings WHERE id = $id";
        $result = $conn->query($sql);
        if ($result && $result->num_rows > 0) {
            $updatedAppointment = $result->fetch_assoc();
            $servicesArray = getServicesWithAcTypes($conn, $id);
            $updatedAppointment['services'] = json_encode($servicesArray);
            echo json_encode($updatedAppointment);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to retrieve updated appointment: " . $conn->error]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to update appointment: " . $conn->error]);
    }
    exit;
}

elseif ($method === 'DELETE' && $id) {
    // Delete an appointment - the cascade delete will remove related services and AC types
    $sql = "DELETE FROM bookings WHERE id = $id";
    if ($conn->query($sql)) {
        echo json_encode(["message" => "Appointment deleted"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to delete appointment: " . $conn->error]);
    }
    exit;
}

else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}

$conn->close();
?>
