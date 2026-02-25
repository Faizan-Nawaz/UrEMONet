import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'dart:math';
import 'notification_screen.dart';
import 'feature_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

// --- CUSTOM PIE CHART CIRCLE ---
class MultiColorCircle extends StatelessWidget {
  const MultiColorCircle({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: 120,
        height: 120,
        child: CustomPaint(painter: CirclePainter()),
      ),
    );
  }
}

class CirclePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    double startAngle = -pi / 2; // start from top
    final strokeWidth = 10.0;

    // Percentages and colors
    final List<Map<String, dynamic>> data = [
      {'value': 75.0, 'color': Colors.yellow},
      {'value': 2.0, 'color': Colors.red},
      {'value': 5.0, 'color': Colors.blue},
      {'value': 8.0, 'color': Colors.grey},
      {'value': 10.0, 'color': Colors.pink},
    ];

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.butt;

    final radius = (size.width / 2) - (strokeWidth / 2);
    final center = Offset(size.width / 2, size.height / 2);

    for (var item in data) {
      final sweepAngle = 2 * pi * (item['value']! / 100);
      paint.color = item['color'] as Color; // <- cast here
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweepAngle,
        false,
        paint,
      );
      startAngle += sweepAngle;
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _pages = [
    const HomePage(),
    const NotificationScreen(), // <- Connect here
    const FeaturesScreen(), // <- Agar features screen hai
    const ProfileScreen(), // <- Agar profile screen hai
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF3E6B3E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF3E6B3E),
        elevation: 0,
        title: const Text(
          "UrEMONet",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Home"),
          BottomNavigationBarItem(
            icon: Icon(Icons.notifications),
            label: "Notify",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.auto_graph),
            label: "Features",
          ),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: "Profile"),
        ],
      ),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  // Track which sub-page is active: 0=Home, 1=Studio, 2=History
  int _activeSubTab = 0;

  File? _selectedVideo;
  Future<void> _pickVideo() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.video,
    );

    if (result != null) {
      setState(() {
        _selectedVideo = File(result.files.single.path!);
      });

      print("Selected video: ${_selectedVideo!.path}");
    } else {
      print("User cancelled video selection");
    }
  }

  final ImagePicker _picker = ImagePicker();
  File? _recordedVideo;

  Future<void> _recordNewVideo() async {
    final XFile? video = await _picker.pickVideo(
      source: ImageSource.camera,
      maxDuration: const Duration(seconds: 30),
    );

    if (video != null) {
      setState(() {
        _recordedVideo = File(video.path);
      });

      print("Recorded video path: ${video.path}");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF3E6B3E),
      width: double.infinity,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- CUSTOM SUB-NAV (Scrolls with the page) ---
            Row(
              children: [
                _buildSubNavButton("Home", 0),
                const SizedBox(width: 20),
                _buildSubNavButton("Studio", 1),
                const SizedBox(width: 20),
                _buildSubNavButton("History", 2),
              ],
            ),
            const Divider(color: Colors.white24, height: 30),

            // --- Switchable Content ---
            if (_activeSubTab == 0) _buildMainDashboard(),
            if (_activeSubTab == 1) _buildStudioContent(),
            if (_activeSubTab == 2) _buildHistoryContent(),
          ],
        ),
      ),
    );
  }

  // Helper to build the text buttons at the top
  Widget _buildSubNavButton(String title, int index) {
    bool isActive = _activeSubTab == index;
    return GestureDetector(
      onTap: () => setState(() => _activeSubTab = index),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              color: isActive ? Colors.white : Colors.white60,
              fontSize: 16,
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          if (isActive)
            Container(
              margin: const EdgeInsets.only(top: 4),
              height: 2,
              width: 20,
              color: Colors.white,
            ),
        ],
      ),
    );
  }

  // --- HOME CONTENT ---
  Widget _buildMainDashboard() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Home Page",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 20),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 40),
          decoration: BoxDecoration(
            border: Border.all(
              color: Colors.white.withOpacity(0.5),
              width: 1.5,
            ),
            borderRadius: BorderRadius.circular(15),
          ),
          child: Column(
            children: [
              if (_selectedVideo == null) ...[
                const Icon(
                  Icons.cloud_upload_outlined,
                  size: 60,
                  color: Colors.white,
                ),
                const SizedBox(height: 15),
                const Text(
                  "Upload Video",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Text(
                  "Drag & Drop Video File Here",
                  style: TextStyle(color: Colors.white60, fontSize: 12),
                ),
              ] else ...[
                const Icon(Icons.videocam, size: 60, color: Colors.greenAccent),
                const SizedBox(height: 15),
                Text(
                  "Selected Video:",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  _selectedVideo!.path.split('/').last,
                  style: const TextStyle(color: Colors.white70, fontSize: 14),
                ),
              ],
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _pickVideo,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: const Color(0xFF3E6B3E),
                ),
                child: Text(
                  _selectedVideo == null ? "Browse Files" : "Change File",
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 30),
        Row(
          children: [
            Expanded(
              child: _buildInfoCard("Tri-Modal Breakdown", Icons.analytics),
            ),
            const SizedBox(width: 15),
            Expanded(
              child: _buildInfoCard("Audio Pitch Analysis", Icons.waves),
            ),
          ],
        ),
        const SizedBox(height: 30),
        Center(
          child: FloatingActionButton(
            onPressed: _recordNewVideo,
            backgroundColor: Colors.redAccent.shade400,
            child: const Icon(Icons.videocam, color: Colors.white),
          ),
        ),

        Align(
          alignment: Alignment.center,
          child: Text(
            "Record new video",
            style: TextStyle(color: Colors.white),
          ),
        ),
        const SizedBox(height: 40),
        Center(
          child: OutlinedButton(
            onPressed: () {},
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Colors.white),
              minimumSize: const Size(200, 50),
            ),
            child: const Text("Analyze", style: TextStyle(color: Colors.white)),
          ),
        ),
      ],
    );
  }

  // --- STUDIO CONTENT ---
  // --- STUDIO CONTENT (Analysis Result) ---
  Widget _buildStudioContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Analysis Result",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 20),

        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Left Column: Video and Breakdown
            Expanded(
              flex: 2,
              child: Column(
                children: [
                  // Video Player Placeholder
                  Container(
                    height: 200,
                    decoration: BoxDecoration(
                      color: Colors.black45,
                      borderRadius: BorderRadius.circular(12),
                      image: const DecorationImage(
                        image: NetworkImage(
                          'https://placeholder.com/video_frame',
                        ), // Replace with actual preview
                        fit: BoxFit.cover,
                      ),
                    ),
                    child: const Center(
                      child: Icon(
                        Icons.play_circle_fill,
                        color: Colors.white,
                        size: 50,
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  // Sentiment Timeline
                  Container(
                    height: 5,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(5),
                      gradient: const LinearGradient(
                        colors: [Colors.blue, Colors.red, Colors.yellow],
                      ),
                    ),
                  ),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "Start: Neutral",
                        style: TextStyle(color: Colors.white60, fontSize: 10),
                      ),
                      Text(
                        "End: Happy",
                        style: TextStyle(color: Colors.white60, fontSize: 10),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Tri-Modal Breakdown List
                  _buildStudioListTile(
                    "Text Analysis",
                    "آج کی خبر بہت اچھی ہے",
                    Icons.description,
                    isUrdu: true,
                  ),
                  _buildStudioListTile(
                    "Audio Pitch",
                    "Waveform View",
                    Icons.waves,
                  ),
                  _buildStudioListTile(
                    "Video Feed",
                    "Facial Sentiment: Joy",
                    Icons.face_retouching_natural,
                  ),
                ],
              ),
            ),

            const SizedBox(width: 20),

            // Right Column: Charts and Stats
            // Right Column: Primary Emotion + Breakdown
            Expanded(
              flex: 1,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // --- PRIMARY EMOTION ---
                  const Text(
                    "Primary Emotion",
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    "Happy:",
                    style: TextStyle(color: Colors.white, fontSize: 14),
                  ),
                  const Text(
                    "88%",
                    style: TextStyle(
                      color: Colors.yellow,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 20),

                  // --- RADAR / POLYGON GRAPH ---
                  Center(
                    child: Container(
                      height: 120,
                      width: 120,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.05),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white24),
                      ),
                      child: CustomPaint(painter: RadarPlaceholderPainter()),
                    ),
                  ),

                  const SizedBox(height: 25),
                  const Divider(color: Colors.white24),

                  // --- DETAILED BREAKDOWN ---
                  const Text(
                    "Detailed Breakdown",
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                  const SizedBox(height: 12),

                  Center(
                    child:
                        MultiColorCircle(), // <-- yahi tumhara new multi-color pie chart hoga
                  ),

                  const SizedBox(height: 15),

                  _buildStatRow("Happy 75%", Colors.yellow),
                  _buildStatRow("Anger 2%", Colors.red),
                  _buildStatRow("Sad 5%", Colors.blue),
                  _buildStatRow("Love 10%", Colors.pink),
                  _buildStatRow("Neutral 8%", Colors.grey),
                ],
              ),
            ),
          ],
        ),

        const SizedBox(height: 30),

        // Download Button
        Center(
          child: ElevatedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.download),
            label: const Text("Download Report"),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.lightBlueAccent,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 45),
            ),
          ),
        ),
      ],
    );
  }

  // Helper for Studio List Items
  Widget _buildStudioListTile(
    String title,
    String subtitle,
    IconData icon, {
    bool isUrdu = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.white, size: 20),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(color: Colors.white70, fontSize: 10),
              ),
              Text(
                subtitle,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontFamily: isUrdu
                      ? 'UrduFont'
                      : null, // Ensure you have an Urdu font in pubspec
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Helper for Stat Legend
  Widget _buildStatRow(String label, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(color: Colors.white, fontSize: 10),
          ),
        ],
      ),
    );
  }
}

// Simple Painter for the Radar Chart Graphic
class RadarPlaceholderPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.blue.withOpacity(0.5)
      ..style = PaintingStyle.fill;

    final path = Path()
      ..moveTo(size.width * 0.5, 0)
      ..lineTo(size.width, size.height * 0.3)
      ..lineTo(size.width * 0.8, size.height)
      ..lineTo(size.width * 0.2, size.height)
      ..lineTo(0, size.height * 0.3)
      ..close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// --- HISTORY CONTENT ---
// --- HISTORY CONTENT (Analysis History) ---
Widget _buildHistoryContent() {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            "Analysis History",
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          // Average Weekly Mood Mini Chart
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text(
                "Average Weekly Mood",
                style: TextStyle(color: Colors.white70, fontSize: 10),
              ),
              const SizedBox(height: 5),
              Row(
                children: [
                  _buildMiniBar(0.4, Colors.lightBlueAccent),
                  const SizedBox(width: 4),
                  _buildMiniBar(0.2, Colors.greenAccent),
                  const SizedBox(width: 4),
                  _buildMiniBar(0.1, Colors.redAccent),
                ],
              ),
            ],
          ),
        ],
      ),
      const SizedBox(height: 20),

      // Search and Filters
      SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildHistoryFilter(Icons.search, "Search by filename..."),
            const SizedBox(width: 10),
            _buildHistoryFilter(Icons.filter_list, "Filter by Emotion"),
            const SizedBox(width: 10),
            _buildHistoryFilter(Icons.calendar_today, "Filter by Date Range"),
          ],
        ),
      ),

      const SizedBox(height: 25),
      const Text(
        "History List",
        style: TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      const SizedBox(height: 15),

      // History Table
      Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white10),
        ),
        child: Column(
          children: [
            // Table Headers
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: const [
                  Expanded(
                    flex: 3,
                    child: Text(
                      "Thumbnail / Filename",
                      style: TextStyle(color: Colors.white60, fontSize: 12),
                    ),
                  ),
                  Expanded(
                    flex: 2,
                    child: Text(
                      "Primary Emotion",
                      style: TextStyle(color: Colors.white60, fontSize: 12),
                    ),
                  ),
                  Expanded(
                    flex: 2,
                    child: Text(
                      "Date",
                      style: TextStyle(color: Colors.white60, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
            const Divider(color: Colors.white10, height: 1),
            // History Rows
            _buildHistoryRow(
              "Project_Happy_Speech_01.mp4",
              "Happy",
              "92%",
              "Jan 29, 2026",
              Colors.greenAccent,
            ),
            _buildHistoryRow(
              "Meeting_Recap_02.mp4",
              "Neutral",
              "78%",
              "Jan 28, 2026",
              Colors.blueAccent,
            ),
            _buildHistoryRow(
              "Angry_Rant_Clip.mp4",
              "Anger",
              "85%",
              "Jan 27, 2026",
              Colors.redAccent,
            ),
            _buildHistoryRow(
              "Sad_News_Segment.mp4",
              "Love",
              "80%",
              "Jan 26, 2026",
              Colors.pinkAccent,
            ),
          ],
        ),
      ),
    ],
  );
}

// Helper for Filter Chips
Widget _buildHistoryFilter(IconData icon, String text) {
  return Container(
    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
    decoration: BoxDecoration(
      color: Colors.white.withOpacity(0.1),
      borderRadius: BorderRadius.circular(8),
    ),
    child: Row(
      children: [
        Icon(icon, color: Colors.white70, size: 16),
        const SizedBox(width: 8),
        Text(text, style: const TextStyle(color: Colors.white70, fontSize: 12)),
      ],
    ),
  );
}

// Helper for History Table Row
Widget _buildHistoryRow(
  String name,
  String emotion,
  String percent,
  String date,
  Color color,
) {
  return Padding(
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    child: Row(
      children: [
        Expanded(
          flex: 3,
          child: Row(
            children: [
              Container(
                width: 35,
                height: 35,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(4),
                  image: const DecorationImage(
                    image: NetworkImage('https://placeholder.com/60'),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  name,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.white, fontSize: 11),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          flex: 2,
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: color.withOpacity(0.5)),
                ),
                child: Text(
                  emotion,
                  style: TextStyle(
                    color: color,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 5),
              Text(
                percent,
                style: const TextStyle(color: Colors.white70, fontSize: 10),
              ),
            ],
          ),
        ),
        Expanded(
          flex: 2,
          child: Text(
            date,
            style: const TextStyle(color: Colors.white60, fontSize: 11),
          ),
        ),
      ],
    ),
  );
}

// Helper for Mini Mood Bars
Widget _buildMiniBar(double heightFactor, Color color) {
  return Container(
    width: 8,
    height: 30 * heightFactor,
    decoration: BoxDecoration(
      color: color,
      borderRadius: BorderRadius.circular(2),
    ),
  );
}

Widget _buildInfoCard(String title, IconData icon) {
  return Container(
    padding: const EdgeInsets.all(15),
    decoration: BoxDecoration(
      color: Colors.white.withOpacity(0.1),
      borderRadius: BorderRadius.circular(10),
    ),
    child: Column(
      children: [
        Icon(icon, color: Colors.white, size: 30),
        const SizedBox(height: 10),
        Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.white, fontSize: 12),
        ),
      ],
    ),
  );
}
