<?php
// availableDates.php

header("Content-Type: application/json");

// Include the database connection file
require_once '../database.php';

// Query to fetch available dates (only dates where is_available = 1)
$sql = "SELECT date FROM available_dates WHERE is_available = 1";
$result = $conn->query($sql);

$dates = array();
if($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Each row's 'date' is returned as a string (e.g., "2025-04-01")
        $dates[] = $row['date'];
    }
}

// Return the dates as JSON
echo json_encode($dates);

$conn->close();
?>
