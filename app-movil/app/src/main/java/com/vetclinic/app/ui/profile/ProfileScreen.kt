package com.vetclinic.app.ui.profile

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.vetclinic.app.data.AuthRepository
import com.vetclinic.app.model.User
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(authRepository: AuthRepository) {
    var user by remember { mutableStateOf<User?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        scope.launch {
            val result = authRepository.getCurrentUser()
            user = result.getOrNull()
            isLoading = false
        }
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Perfil de Usuario", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(24.dp))

        if (isLoading) {
            CircularProgressIndicator()
        } else if (user != null) {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Nombre: ${user!!.full_name}", style = MaterialTheme.typography.titleLarge)
                    Text("Email: ${user!!.email}", style = MaterialTheme.typography.bodyLarge)
                    Text("Teléfono: ${user!!.phone}", style = MaterialTheme.typography.bodyLarge)
                    Text("Rol: ${user!!.role}", style = MaterialTheme.typography.bodyMedium)
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Button(
                onClick = { authRepository.logout() },
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Cerrar Sesión")
            }
        } else {
            Text("Error al cargar perfil")
        }
    }
}
