<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once '../database.php';

// Get the service from the query string (if provided)
$service = isset($_GET['service']) ? $conn->real_escape_string($_GET['service']) : "";

// Define the date range
$startDate = $_GET['start'] ?? date("Y-m-d");
$endDate   = $_GET['end'] ?? date("Y-m-d", strtotime("+30 days"));

// Query to count accepted appointments on each date for this service
// We join booking_services with bookings to check the status.
$query = "SELECT bs.appointment_date, COUNT(*) AS count 
          FROM booking_services bs
          JOIN bookings b ON bs.booking_id = b.id
          WHERE b.status = 'Accepted'
            AND bs.appointment_date BETWEEN '$startDate' AND '$endDate'";
if ($service) {
    $query .= " AND bs.service_type = '$service'";
}
$query .= " GROUP BY bs.appointment_date";

$result = $conn->query($query);
$bookedDates = [];
while ($row = $result->fetch_assoc()) {
    $bookedDates[$row['appointment_date']] = $row['count'];
}

// Loop through each date in the range and include only those with fewer than 2 accepted appointments
$availableDates = [];
$current = strtotime($startDate);
$end = strtotime($endDate);
while ($current <= $end) {
    $dateStr = date("Y-m-d", $current);
    if (!isset($bookedDates[$dateStr]) || $bookedDates[$dateStr] < 2) {
        $availableDates[] = $dateStr;
    }
    $current = strtotime("+1 day", $current);
}

echo json_encode($availableDates);
$conn->close();
?>
