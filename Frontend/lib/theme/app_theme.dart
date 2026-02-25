import 'package:flutter/material.dart';

const Color primaryGreen = Color(0xFF3E6B3E);

final ThemeData appTheme = ThemeData(
  scaffoldBackgroundColor: primaryGreen,
  fontFamily: 'Serif',
  inputDecorationTheme: const InputDecorationTheme(
    enabledBorder: UnderlineInputBorder(
      borderSide: BorderSide(color: Colors.white),
    ),
    focusedBorder: UnderlineInputBorder(
      borderSide: BorderSide(color: Colors.white),
    ),
    labelStyle: TextStyle(color: Colors.white),
  ),
);
