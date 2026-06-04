import 'package:flutter/material.dart';
import 'package:uremonet/screens/helpcenter_screen.dart';
import 'package:uremonet/screens/login_screen.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:uremonet/screens/edit_profile_screen.dart';
import 'package:uremonet/screens/privacy_screen.dart';
import 'package:uremonet/screens/setting_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    User? user = FirebaseAuth.instance.currentUser;

    String email = user?.email ?? "No Email";
    String name = email.split('@')[0]; // email ka first part as name

    return Container(
      // Matching your 0xFF3E6B3E Login Theme
      color: const Color(0xFF3E6B3E),
      width: double.infinity,
      height: double.infinity,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const SizedBox(height: 20),

            // --- Profile Header ---
            const CircleAvatar(
              radius: 55,
              backgroundColor: Colors.white24,
              child: CircleAvatar(
                radius: 50,
                backgroundImage: NetworkImage(
                  'https://via.placeholder.com/100',
                ), // Replace with actual user image
              ),
            ),
            const SizedBox(height: 15),
            Text(
              name,

              style: const TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              email,
              style: const TextStyle(color: Colors.white60, fontSize: 14),
            ),
            const SizedBox(height: 30),

            // --- Statistics Row (Matching Home/Studio Style) ---
            Row(
              children: [
                Expanded(child: _buildStatCard("Videos Analyzed", "24")),
                const SizedBox(width: 15),
                Expanded(child: _buildStatCard("Current Plan", "Pro")),
              ],
            ),

            const SizedBox(height: 30),

            // --- Menu Options ---
            _buildProfileMenuTile(Icons.person_outline, "Edit Profile", () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => EditProfileScreen()),
              );
            }),
            _buildProfileMenuTile(Icons.security, "Privacy & Security", () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => PrivacySecurityScreen()),
              );
            }),
            _buildProfileMenuTile(Icons.help_outline, "Help Center", () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => HelpCenterScreen()),
              );
            }),
            _buildProfileMenuTile(Icons.settings_outlined, "App Settings", () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => AppSettingsScreen()),
              );
            }),

            const SizedBox(height: 40),

            // --- Logout Button ---
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () async {
                  // 1️⃣ Show confirmation dialog
                  bool? confirm = await showDialog<bool>(
                    context: context,
                    builder: (context) {
                      return AlertDialog(
                        title: const Text("Confirm Logout"),
                        content: const Text("Are you sure you want to logout?"),
                        actions: [
                          TextButton(
                            onPressed: () {
                              Navigator.of(context).pop(false); // Cancel
                            },
                            child: const Text("No"),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.of(context).pop(true); // Confirm
                            },
                            child: const Text("Yes"),
                          ),
                        ],
                      );
                    },
                  );

                  // 2️⃣ If user confirmed
                  if (confirm == true) {
                    await FirebaseAuth.instance.signOut();

                    // Navigate to login screen and remove previous screens
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                      (route) => false,
                    );
                  }
                },
                icon: const Icon(Icons.logout),
                label: const Text("LOGOUT"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent.shade400,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),
            const Text(
              "UrEMONet v1.0.2",
              style: TextStyle(color: Colors.white24, fontSize: 10),
            ),
          ],
        ),
      ),
    );
  }

  // Helper for Statistics
  Widget _buildStatCard(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            label,
            style: const TextStyle(color: Colors.white60, fontSize: 12),
          ),
        ],
      ),
    );
  }

  // Helper for Menu Items
  Widget _buildProfileMenuTile(
    IconData icon,
    String title,
    VoidCallback onTap,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        leading: Icon(icon, color: Colors.white70),
        title: Text(
          title,
          style: const TextStyle(color: Colors.white, fontSize: 16),
        ),
        trailing: const Icon(Icons.chevron_right, color: Colors.white30),
        onTap: onTap,
      ),
    );
  }
}
