import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import Header from '../components/Header';
import Hero from '../components/Hero';
import PopularCourses from '../components/PopularCourses';
import QuiceServices from './QuiceServices';
import WhyChooseDrishtee from '../components/WhyChooseDrishtee';
import LetestNotice from '../components/LetestNotice';
import StudentTestimonials from '../components/StudentTestimonials';
import QuickInquiryWidget from '../components/QuickInquiryModal';
import DirectorMessage from '../components/DirectorMessage';

export default function HomeScreen() {
  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Header />
        <Hero />
        <PopularCourses />
        <QuiceServices />
        <WhyChooseDrishtee />
        <LetestNotice />
        <StudentTestimonials />
        <QuickInquiryWidget />
        <DirectorMessage />
         <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f4f7fb' },
  container: { flex: 1 },
});