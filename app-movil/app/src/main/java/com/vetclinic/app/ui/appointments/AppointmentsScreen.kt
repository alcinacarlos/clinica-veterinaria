package com.vetclinic.app.ui.appointments

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.vetclinic.app.api.VetApiService
import com.vetclinic.app.model.Appointment
import com.vetclinic.app.model.Service
import kotlinx.coroutines.launch

@Composable
fun AppointmentsScreen(apiService: VetApiService) {
    var appointments by remember { mutableStateOf<List<Appointment>>(emptyList()) }
    var services by remember { mutableStateOf<List<Service>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        scope.launch {
            try {
                appointments = apiService.getAppointments()
                services = apiService.getServices()
            } catch (e: Exception) {
            } finally {
                isLoading = false
            }
        }
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Tus Citas", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))

        if (isLoading) {
            CircularProgressIndicator()
        } else {
            Text("Reservar Servicio", style = MaterialTheme.typography.titleLarge)
            LazyColumn(modifier = Modifier.height(200.dp)) {
                items(services) { service ->
                    ServiceItem(service)
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Text("Próximas Citas", style = MaterialTheme.typography.titleLarge)
            LazyColumn {
                items(appointments) { appointment ->
                    AppointmentCard(appointment)
                }
            }
        }
    }
}

@Composable
fun ServiceItem(service: Service) {
    Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
        Row(modifier = Modifier.padding(8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Column {
                Text(service.name, style = MaterialTheme.typography.bodyLarge)
                Text("${service.price}€ - ${service.duration_minutes} min", style = MaterialTheme.typography.bodySmall)
            }
            Button(onClick = { /* Book */ }) {
                Text("Reservar")
            }
        }
    }
}

@Composable
fun AppointmentCard(appointment: Appointment) {
    Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Cita: ${appointment.scheduled_at}", style = MaterialTheme.typography.bodyLarge)
            Text("Estado: ${appointment.status}", style = MaterialTheme.typography.bodyMedium)
            if (appointment.notes.isNotEmpty()) {
                Text("Notas: ${appointment.notes}", style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}
