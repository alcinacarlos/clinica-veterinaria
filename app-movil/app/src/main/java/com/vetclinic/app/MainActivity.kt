package com.vetclinic.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.*
import com.vetclinic.app.api.NetworkModule
import com.vetclinic.app.data.AuthRepository
import com.vetclinic.app.data.SessionManager
import com.vetclinic.app.ui.auth.*
import com.vetclinic.app.ui.home.HomeScreen
import com.vetclinic.app.ui.shop.ShopScreen
import com.vetclinic.app.ui.appointments.AppointmentsScreen
import com.vetclinic.app.ui.profile.ProfileScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val sessionManager = SessionManager(this)
        val apiService = NetworkModule.provideApiService(this)
        val authRepository = AuthRepository(apiService, sessionManager)

        setContent {
            MaterialTheme {
                val navController = rememberNavController()
                val authViewModel: AuthViewModel = viewModel(factory = AuthViewModelFactory(authRepository))
                
                NavHost(navController = navController, startDestination = if (authRepository.isLoggedIn()) "main" else "login") {
                    composable("login") {
                        LoginScreen(
                            viewModel = authViewModel,
                            onLoginSuccess = { navController.navigate("main") { popUpTo("login") { inclusive = true } } },
                            onNavigateToRegister = { navController.navigate("register") }
                        )
                    }
                    composable("register") {
                        RegisterScreen(
                            viewModel = authViewModel,
                            onRegisterSuccess = { navController.navigate("main") { popUpTo("login") { inclusive = true } } },
                            onNavigateToLogin = { navController.navigate("login") }
                        )
                    }
                    composable("main") {
                        MainScreen(authRepository, apiService)
                    }
                }
            }
        }
    }
}

@Composable
fun MainScreen(authRepository: AuthRepository, apiService: com.vetclinic.app.api.VetApiService) {
    val navController = rememberNavController()
    
    Scaffold(
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination
                
                val items = listOf(
                    NavigationItem("home", "Inicio", Icons.Default.Home),
                    NavigationItem("shop", "Tienda", Icons.Default.ShoppingCart),
                    NavigationItem("appointments", "Citas", Icons.Default.DateRange),
                    NavigationItem("profile", "Perfil", Icons.Default.Person)
                )
                
                items.forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.label) },
                        label = { Text(item.label) },
                        selected = currentDestination?.hierarchy?.any { it.route == item.route } == true,
                        onClick = {
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(navController, startDestination = "home", Modifier.padding(innerPadding)) {
            composable("home") { HomeScreen(apiService) }
            composable("shop") { ShopScreen(apiService) }
            composable("appointments") { AppointmentsScreen(apiService) }
            composable("profile") { ProfileScreen(authRepository) }
        }
    }
}

data class NavigationItem(val route: String, val label: String, val icon: androidx.compose.ui.graphics.vector.ImageVector)

class AuthViewModelFactory(private val repository: AuthRepository) : androidx.lifecycle.ViewModelProvider.Factory {
    override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
        return AuthViewModel(repository) as T
    }
}
