import 'package:flutter/material.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF3E6B3E), // Matching your Login Theme
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(20.0),
            child: Text(
              "Notifications",
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 15),
              children: [
                _buildNotificationItem(
                  title: "Analysis Complete",
                  subtitle: "Project_Happy_Speech_01.mp4 is ready for viewing.",
                  time: "2 mins ago",
                  icon: Icons.check_circle,
                  iconColor: Colors.greenAccent,
                  isUnread: true,
                ),
                _buildNotificationItem(
                  title: "Processing Video",
                  subtitle: "Meeting_Recap_02.mp4 is being analyzed (45%).",
                  time: "15 mins ago",
                  icon: Icons.sync,
                  iconColor: Colors.lightBlueAccent,
                  isUnread: false,
                ),
                _buildNotificationItem(
                  title: "New Feature Available",
                  subtitle: "Check out the new Audio Pitch waveform in Studio!",
                  time: "1 hour ago",
                  icon: Icons.auto_awesome,
                  iconColor: Colors.amberAccent,
                  isUnread: false,
                ),
                _buildNotificationItem(
                  title: "Analysis Failed",
                  subtitle: "File 'short_clip.mp4' was too short to analyze.",
                  time: "5 hours ago",
                  icon: Icons.error_outline,
                  iconColor: Colors.redAccent,
                  isUnread: false,
                ),
                const SizedBox(height: 20),
                Center(
                  child: TextButton(
                    onPressed: () {},
                    child: const Text(
                      "Mark all as read",
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationItem({
    required String title,
    required String subtitle,
    required String time,
    required IconData icon,
    required Color iconColor,
    required bool isUnread,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isUnread
            ? Colors.white.withOpacity(0.15)
            : Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isUnread ? Colors.white30 : Colors.white10,
          width: 1,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            backgroundColor: iconColor.withOpacity(0.2),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      time,
                      style: const TextStyle(
                        color: Colors.white54,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                Text(
                  subtitle,
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ),
          if (isUnread)
            Container(
              margin: const EdgeInsets.only(left: 10, top: 5),
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: Colors.lightBlueAccent,
                shape: BoxShape.circle,
              ),
            ),
        ],
      ),
    );
  }
}
