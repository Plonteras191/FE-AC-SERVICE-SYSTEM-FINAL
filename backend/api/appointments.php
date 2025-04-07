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

if ($method === 'GET') {
    // Fetch all appointments with their services and AC types
    $sql = "SELECT b.*, 
            GROUP_CONCAT(DISTINCT bs.service_type, ':', bs.appointment_date SEPARATOR '|') as services,
            GROUP_CONCAT(DISTINCT ba.ac_type SEPARATOR ',') as ac_types
            FROM bookings b
            LEFT JOIN booking_services bs ON b.id = bs.booking_id
            LEFT JOIN booking_actypes ba ON b.id = ba.booking_id
            GROUP BY b.id";
    
    $result = $conn->query($sql);
    if (!$result) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $conn->error]);
        exit;
    }
    
    $appointments = [];
    while ($row = $result->fetch_assoc()) {
        // Convert pipe-separated services to JSON format for frontend compatibility
        if (!empty($row['services'])) {
            $servicesArray = [];
            $services = explode('|', $row['services']);
            foreach ($services as $service) {
                $parts = explode(':', $service);
                if (count($parts) === 2) {
                    $servicesArray[] = [
                        'type' => $parts[0],
                        'date' => $parts[1]
                    ];
                }
            }
            $row['services'] = json_encode($servicesArray);
        } else {
            $row['services'] = json_encode([]);
        }
        
        // Convert comma-separated AC types to array
        if (!empty($row['ac_types'])) {
            $row['ac_types'] = explode(',', $row['ac_types']);
        } else {
            $row['ac_types'] = [];
        }
        
        $appointments[] = $row;
    }
    
    echo json_encode($appointments);
    exit;
}

// POST branch for accepting or completing an appointment
elseif ($method === 'POST' && isset($_GET['action']) && in_array($_GET['action'], ['accept', 'complete']) && $id) {
    // Determine new status based on the action
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
        // Fetch the updated appointment with services and AC types
        $sql = "SELECT b.*, 
                GROUP_CONCAT(DISTINCT bs.service_type, ':', bs.appointment_date SEPARATOR '|') as services,
                GROUP_CONCAT(DISTINCT ba.ac_type SEPARATOR ',') as ac_types
                FROM bookings b
                LEFT JOIN booking_services bs ON b.id = bs.booking_id
                LEFT JOIN booking_actypes ba ON b.id = ba.booking_id
                WHERE b.id = $id
                GROUP BY b.id";
        
        $result = $conn->query($sql);
        if ($result && $result->num_rows > 0) {
            $updatedAppointment = $result->fetch_assoc();
            
            // Convert pipe-separated services to JSON format
            if (!empty($updatedAppointment['services'])) {
                $servicesArray = [];
                $services = explode('|', $updatedAppointment['services']);
                foreach ($services as $service) {
                    $parts = explode(':', $service);
                    if (count($parts) === 2) {
                        $servicesArray[] = [
                            'type' => $parts[0],
                            'date' => $parts[1]
                        ];
                    }
                }
                $updatedAppointment['services'] = json_encode($servicesArray);
            } else {
                $updatedAppointment['services'] = json_encode([]);
            }
            
            // Convert comma-separated AC types to array
            if (!empty($updatedAppointment['ac_types'])) {
                $updatedAppointment['ac_types'] = explode(',', $updatedAppointment['ac_types']);
            } else {
                $updatedAppointment['ac_types'] = [];
            }
            
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
        // Return the updated appointment with all its details
        $sql = "SELECT b.*, 
                GROUP_CONCAT(DISTINCT bs.service_type, ':', bs.appointment_date SEPARATOR '|') as services,
                GROUP_CONCAT(DISTINCT ba.ac_type SEPARATOR ',') as ac_types
                FROM bookings b
                LEFT JOIN booking_services bs ON b.id = bs.booking_id
                LEFT JOIN booking_actypes ba ON b.id = ba.booking_id
                WHERE b.id = $id
                GROUP BY b.id";
        
        $result = $conn->query($sql);
        if ($result && $result->num_rows > 0) {
            $updatedAppointment = $result->fetch_assoc();
            
            // Convert pipe-separated services to JSON format
            if (!empty($updatedAppointment['services'])) {
                $servicesArray = [];
                $services = explode('|', $updatedAppointment['services']);
                foreach ($services as $service) {
                    $parts = explode(':', $service);
                    if (count($parts) === 2) {
                        $servicesArray[] = [
                            'type' => $parts[0],
                            'date' => $parts[1]
                        ];
                    }
                }
                $updatedAppointment['services'] = json_encode($servicesArray);
            } else {
                $updatedAppointment['services'] = json_encode([]);
            }
            
            // Convert comma-separated AC types to array
            if (!empty($updatedAppointment['ac_types'])) {
                $updatedAppointment['ac_types'] = explode(',', $updatedAppointment['ac_types']);
            } else {
                $updatedAppointment['ac_types'] = [];
            }
            
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