import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class HelpCenterScreen extends StatelessWidget {
  const HelpCenterScreen({super.key});

  // Example FAQs
  final List<Map<String, String>> faqs = const [
    {
      "question": "How to reset my password?",
      "answer":
          "Go to Settings > Privacy & Security > Change Password to reset your password.",
    },
    {
      "question": "How to delete my account?",
      "answer":
          "Please contact support via email to delete your account permanently.",
    },
    {
      "question": "How to contact support?",
      "answer": "You can contact support via email or chat from this screen.",
    },
  ];

  // Example support email
  final String supportEmail = "support@uremonet.com";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Help Center"),
        centerTitle: true,
        backgroundColor: const Color(0xFF3E6B3E),
      ),
      backgroundColor: const Color(0xFF3E6B3E),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Frequently Asked Questions",
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 15),

            // FAQ List
            ...faqs.map(
              (faq) => _buildFAQTile(faq["question"]!, faq["answer"]!),
            ),

            const SizedBox(height: 30),
            const Text(
              "Contact Support",
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 15),

            _buildSupportButton(
              context,
              icon: Icons.email_outlined,
              title: "Email Support",
              onTap: () => _launchEmail(supportEmail),
            ),
            _buildSupportButton(
              context,
              icon: Icons.chat_outlined,
              title: "Live Chat",
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Live Chat coming soon!")),
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

  // Helper: FAQ Tile
  Widget _buildFAQTile(String question, String answer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
      ),
      child: ExpansionTile(
        title: Text(
          question,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
            child: Text(answer, style: const TextStyle(color: Colors.white60)),
          ),
        ],
      ),
    );
  }

  // Helper: Support Button
  Widget _buildSupportButton(
    BuildContext context, {
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

  // Launch email
  void _launchEmail(String email) async {
    final Uri params = Uri(
      scheme: 'mailto',
      path: email,
      query: 'subject=Support Request&body=Hello Support Team,',
    );
    if (await canLaunchUrl(params)) {
      await launchUrl(params);
    }
  }
}
