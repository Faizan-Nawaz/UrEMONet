import 'package:flutter/material.dart';

class PrivacySecurityScreen extends StatefulWidget {
  const PrivacySecurityScreen({super.key});

  @override
  State<PrivacySecurityScreen> createState() => _PrivacySecurityScreenState();
}

class _PrivacySecurityScreenState extends State<PrivacySecurityScreen> {
  // Example toggle states
  bool isProfilePrivate = false;
  bool isTwoFactorAuth = true;
  bool isDataSharingAllowed = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Privacy & Security"),
        backgroundColor: const Color(0xFF3E6B3E),
        centerTitle: true,
      ),
      backgroundColor: const Color(0xFF3E6B3E),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Privacy Settings",
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 15),

            // Profile Privacy Toggle
            _buildToggleTile(
              title: "Private Profile",
              subtitle: "Only approved followers can see your profile",
              value: isProfilePrivate,
              onChanged: (val) {
                setState(() {
                  isProfilePrivate = val;
                });
              },
            ),

            // Two Factor Authentication Toggle
            _buildToggleTile(
              title: "Two-Factor Authentication",
              subtitle: "Enhance account security with 2FA",
              value: isTwoFactorAuth,
              onChanged: (val) {
                setState(() {
                  isTwoFactorAuth = val;
                });
              },
            ),

            // Data Sharing Toggle
            _buildToggleTile(
              title: "Allow Data Sharing",
              subtitle: "Share anonymous usage data with us",
              value: isDataSharingAllowed,
              onChanged: (val) {
                setState(() {
                  isDataSharingAllowed = val;
                });
              },
            ),

            const SizedBox(height: 30),
            const Text(
              "Account Security",
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 15),

            // Change Password Button
            _buildButtonTile(
              icon: Icons.lock_outline,
              title: "Change Password",
              onTap: () {
                // Navigate to Change Password screen or logic
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Change Password tapped")),
                );
              },
            ),

            // View Active Sessions Button
            _buildButtonTile(
              icon: Icons.devices,
              title: "Active Sessions",
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Active Sessions tapped")),
                );
              },
            ),

            // Security Tips Button
            _buildButtonTile(
              icon: Icons.info_outline,
              title: "Security Tips",
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Security Tips tapped")),
                );
              },
            ),

            const SizedBox(height: 40),
            Center(
              child: Text(
                "UrEMONet v1.0.2",
                style: TextStyle(color: Colors.white24, fontSize: 10),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Helper for Toggle Tiles
  Widget _buildToggleTile({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Flexible(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: const TextStyle(color: Colors.white60, fontSize: 12),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: Colors.greenAccent,
          ),
        ],
      ),
    );
  }

  // Helper for Button Tiles
  Widget _buildButtonTile({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
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
