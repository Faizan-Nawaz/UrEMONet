import 'package:flutter/material.dart';
import 'login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 5), () {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const SizedBox(height: 100),

          const Text(
            "HEY WELCOME !",
            style: TextStyle(
              color: Color(0xFF3E6B3E),
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 20),

          const CircularProgressIndicator(
            color: Color(0xFF3E6B3E),
            strokeWidth: 3,
          ),

          Container(
            height: 350,
            width: double.infinity,
            decoration: const BoxDecoration(
              color: Color(0xFF3E6B3E),
              borderRadius: BorderRadius.vertical(top: Radius.circular(200)),
            ),
            child: const Center(
              child: Text(
                "UrEMONet",
                style: TextStyle(color: Colors.white, fontSize: 18),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
