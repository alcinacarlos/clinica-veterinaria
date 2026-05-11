package com.vetclinic.app.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.vetclinic.app.api.VetApiService
import com.vetclinic.app.model.Pet
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(apiService: VetApiService) {
    var pets by remember { mutableStateOf<List<Pet>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        scope.launch {
            try {
                pets = apiService.getPets()
            } catch (e: Exception) {
                // Handle error
            } finally {
                isLoading = false
            }
        }
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Nuestras Mascotas", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))

        if (isLoading) {
            CircularProgressIndicator()
        } else {
            LazyColumn {
                items(pets) { pet ->
                    PetCard(pet)
                }
            }
        }
    }
}

@Composable
fun PetCard(pet: Pet) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Column {
            AsyncImage(
                model = pet.image_url,
                contentDescription = pet.name,
                modifier = Modifier.fillMaxWidth().height(200.dp),
                contentScale = ContentScale.Crop
            )
            PaddingValues(16.dp).let {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(pet.name, style = MaterialTheme.typography.titleLarge)
                    Text("${pet.species} - ${pet.breed}", style = MaterialTheme.typography.bodyMedium)
                    Text("Edad: ${pet.age_years} años", style = MaterialTheme.typography.bodySmall)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(pet.description, style = MaterialTheme.typography.bodyMedium)
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(onClick = { /* Handle adoption request */ }) {
                        Text("Solicitar Adopción")
                    }
                }
            }
        }
    }
}
