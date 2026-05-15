import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StatusBar } from "expo-status-bar";
import OverviewScreen from "@/screens/OverviewScreen";
import InferenceScreen from "@/screens/InferenceScreen";
import TextInferenceScreen from "@/screens/TextInferenceScreen";
import DatasetsScreen from "@/screens/DatasetsScreen";
import ModelsScreen from "@/screens/ModelsScreen";
import ResultsScreen from "@/screens/ResultsScreen";
import { colors } from "@/theme/colors";
import { APP } from "@/config/app";

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.sidebarActive,
    background: colors.sidebar,
    card: colors.sidebar,
    text: "#f1f5f9",
    border: "#334155",
    notification: colors.indigo,
  },
};

export default function NavigationRoot() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={{
            headerShadowVisible: false,
            headerTintColor: "#fff",
            headerStyle: { backgroundColor: colors.sidebar },
            headerTitleStyle: { fontWeight: "700", fontSize: 16 },
            tabBarStyle: {
              backgroundColor: colors.sidebar,
              borderTopColor: "#334155",
              height: 56,
            },
            tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginBottom: 2 },
            tabBarIconStyle: { marginTop: 4 },
            tabBarActiveTintColor: "#c7d2fe",
            tabBarInactiveTintColor: "#64748b",
            tabBarHideOnKeyboard: true,
          }}
        >
          <Tab.Screen
            name="Overview"
            component={OverviewScreen}
            options={{
              title: APP.name,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="grid-outline" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Inference"
            component={InferenceScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="flask-outline" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="LLMShield"
            component={TextInferenceScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="chatbubble-ellipses-outline" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Datasets"
            component={DatasetsScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="albums-outline" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Models"
            component={ModelsScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="hardware-chip-outline" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Results"
            component={ResultsScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="stats-chart-outline" color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
