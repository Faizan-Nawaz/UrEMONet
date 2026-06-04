import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class ForgotPassword extends StatefulWidget {
  const ForgotPassword({super.key});
  @override
  State<ForgotPassword> createState() => _ForgotPasswordState();
}

class _ForgotPasswordState extends State<ForgotPassword> {
  final TextEditingController emailController = TextEditingController();
  final AuthService _authService = AuthService();
  @override
  void dispose() {
    emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF3E6B3E),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 30),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              "FORGOT PASSWORD",
              style: TextStyle(color: Colors.white, fontSize: 20),
            ),
            const SizedBox(height: 20),
            const Text(
              "Enter emial, we will send reset link.",
              style: TextStyle(color: Colors.white, fontSize: 15),
            ),
            TextField(
              controller: emailController,
              decoration: const InputDecoration(
                labelText: "Email",
                prefixIcon: Icon(Icons.email, color: Colors.white),
                labelStyle: TextStyle(color: Colors.white),
                enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: Colors.white),
                ),
              ),
            ),

            const SizedBox(height: 30),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 45),
              ),
              onPressed: () async {
                final email = emailController.text.trim();

                // EMPTY CHECK
                if (email.isEmpty) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(const SnackBar(content: Text("Enter email")));
                  return;
                }

                // EMAIL FORMAT CHECK
                if (!email.contains('@') || !email.contains('.')) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Enter valid email.")),
                  );
                  return;
                }

                try {
                  await _authService.resetPassword(email: email);

                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Check your email.")),
                  );

                  Navigator.pop(context); // back to login
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Email not registered.")),
                  );
                }
              },
              child: const Text(
                "SEND RESET LINK",
                style: TextStyle(color: Color(0xFF3E6B3E)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
