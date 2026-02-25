import 'package:flutter/material.dart';

class FeaturesScreen extends StatelessWidget {
  const FeaturesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      // Matching your 0xFF3E6B3E Login Theme
      color: const Color(0xFF3E6B3E),
      width: double.infinity,
      height: double.infinity,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "UrEMONet Features",
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 10),
            const Text(
              "Our advanced Tri-Modal system ensures precision in Urdu emotional intelligence.",
              style: TextStyle(fontSize: 14, color: Colors.white70),
            ),
            const SizedBox(height: 30),

            // --- Feature Cards ---
            _buildFeatureCard(
              title: "Tri-Modal Data Fusion",
              description:
                  "Combines text, audio, and facial analysis simultaneously for maximum accuracy.",
              icon: Icons.hub_outlined,
              accentColor: Colors.blueAccent,
            ),
            _buildFeatureCard(
              title: "Urdu Script NLP",
              description:
                  "Deep learning models specifically trained on Nastaliq and Urdu phonetics.",
              icon: Icons.translate,
              accentColor: Colors.orangeAccent,
            ),
            _buildFeatureCard(
              title: "Real-time Pitch Mapping",
              description:
                  "Analyzes vocal frequency and tone to detect underlying emotional stress.",
              icon: Icons.graphic_eq,
              accentColor: Colors.greenAccent,
            ),
            _buildFeatureCard(
              title: "Facial Micro-Expressions",
              description:
                  "Detects subtle changes in facial muscles to identify joy, anger, and sadness.",
              icon: Icons.face_retouching_natural,
              accentColor: Colors.pinkAccent,
            ),
            _buildFeatureCard(
              title: "Automated Reporting",
              description:
                  "Generate and download comprehensive PDF reports of your analysis results.",
              icon: Icons.picture_as_pdf_outlined,
              accentColor: Colors.lightBlueAccent,
            ),

            const SizedBox(height: 20),

            // --- Bottom CTA ---
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(15),
                border: Border.all(color: Colors.white24),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.white70),
                  SizedBox(width: 15),
                  Expanded(
                    child: Text(
                      "All analysis is processed securely and encrypted for your privacy.",
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Helper method to build feature items
  Widget _buildFeatureCard({
    required String title,
    required String description,
    required IconData icon,
    required Color accentColor,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1), // Glassmorphism effect
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: accentColor.withOpacity(0.2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: accentColor, size: 28),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  description,
                  style: const TextStyle(
                    color: Colors.white60,
                    fontSize: 13,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
