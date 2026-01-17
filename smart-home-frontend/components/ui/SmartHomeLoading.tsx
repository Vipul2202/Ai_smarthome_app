import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/providers/ThemeProvider';

interface SmartHomeLoadingProps {
  text?: string;
  onComplete?: () => void;
}

interface House {
  id: number;
  x: number;
  y: number;
  scale: Animated.Value;
  opacity: Animated.Value;
}

interface Particle {
  id: number;
  x: number;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const SmartHomeLoading: React.FC<SmartHomeLoadingProps> = ({
  text = "Loading your houses...",
  onComplete
}) => {
  const { colors, isDark } = useTheme();
  const [progress, setProgress] = useState(0);
  const [houses, setHouses] = useState<House[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Animated values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.spring(logoScaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev >= 100 ? 100 : prev + 2;
        
        // Animate progress circle
        Animated.timing(progressAnim, {
          toValue: newProgress / 100,
          duration: 100,
          useNativeDriver: false,
        }).start();

        if (newProgress === 100 && onComplete) {
          setTimeout(onComplete, 1000);
        }

        return newProgress;
      });
    }, 80);

    // Pulse animation
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulseAnimation());
    };
    pulseAnimation();

    // Rotation animation
    const rotateAnimation = () => {
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }).start(() => {
        rotateAnim.setValue(0);
        rotateAnimation();
      });
    };
    rotateAnimation();

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    // Generate houses based on progress
    if (progress % 15 === 0 && progress > 0 && houses.length < 8) {
      const newHouse: House = {
        id: Date.now(),
        x: Math.random() * (screenWidth - 80) + 40,
        y: Math.random() * (screenHeight * 0.4) + screenHeight * 0.3,
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
      };

      // Animate house appearance
      Animated.parallel([
        Animated.spring(newHouse.scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(newHouse.opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      setHouses(prev => [...prev, newHouse]);
    }

    if (progress === 0) {
      setHouses([]);
    }
  }, [progress]);

  useEffect(() => {
    // Generate floating particles
    const particleInterval = setInterval(() => {
      const newParticle: Particle = {
        id: Date.now() + Math.random(),
        x: Math.random() * screenWidth,
        y: new Animated.Value(screenHeight + 20),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0),
      };

      // Animate particle floating up
      Animated.parallel([
        Animated.timing(newParticle.y, {
          toValue: -50,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(newParticle.opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.delay(3000),
          Animated.timing(newParticle.opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(newParticle.scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      setParticles(prev => [...prev, newParticle]);
    }, 300);

    // Clean old particles
    const cleanupInterval = setInterval(() => {
      setParticles(prev => prev.filter(p => Date.now() - p.id < 5000));
    }, 1000);

    return () => {
      clearInterval(particleInterval);
      clearInterval(cleanupInterval);
    };
  }, []);

  const getLoadingText = () => {
    if (progress < 25) return "Searching properties...";
    if (progress < 50) return "Analyzing locations...";
    if (progress < 75) return "Checking smart features...";
    if (progress < 100) return "Almost ready...";
    return "Loading complete!";
  };

  const gradientColors = isDark 
    ? ['#1F2937', '#374151', '#4B5563'] as const
    : ['#3B82F6', '#8B5CF6', '#EC4899'] as const;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating particles */}
      {particles.map(particle => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.x,
              transform: [
                { translateY: particle.y },
                { scale: particle.scale }
              ],
              opacity: particle.opacity,
            }
          ]}
        >
          <Ionicons name="sparkles" size={16} color="#FCD34D" />
        </Animated.View>
      ))}

      {/* App Logo */}
      <Animated.View 
        style={[
          styles.logoContainer,
          { transform: [{ scale: logoScaleAnim }] }
        ]}
      >
        <View style={[styles.logoBackground, { backgroundColor: colors.surface }]}>
          <Ionicons name="home" size={40} color={colors.primary} />
        </View>
        <Text style={[styles.appTitle, { color: 'white' }]}>SmartHome</Text>
        <Text style={[styles.appSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
          Finding your dream home
        </Text>
      </Animated.View>

      {/* Main loading circle */}
      <View style={styles.loadingContainer}>
        {/* Outer rotating ring */}
        <Animated.View
          style={[
            styles.outerRing,
            { transform: [{ rotate: spin }] }
          ]}
        >
          <LinearGradient
            colors={['#FCD34D', '#EC4899', '#3B82F6'] as const}
            style={styles.gradientRing}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* Pulsing ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            { transform: [{ scale: pulseAnim }] }
          ]}
        />

        {/* Center circle */}
        <View style={[styles.centerCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <View style={styles.progressContainer}>
            {/* Progress circle */}
            <Animated.View style={styles.progressCircle}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    transform: [{
                      rotate: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      })
                    }]
                  }
                ]}
              />
            </Animated.View>
            
            {/* Progress text */}
            <View style={styles.progressText}>
              <Text style={styles.progressNumber}>{progress}%</Text>
              <Ionicons name="flash" size={24} color="#FCD34D" />
            </View>
          </View>
        </View>
      </View>

      {/* Generated houses */}
      {houses.map((house) => (
        <Animated.View
          key={house.id}
          style={[
            styles.house,
            {
              left: house.x,
              top: house.y,
              transform: [{ scale: house.scale }],
              opacity: house.opacity,
            }
          ]}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F3F4F6'] as const}
            style={styles.houseBackground}
          >
            <Ionicons name="home" size={28} color={colors.primary} />
          </LinearGradient>
          <View style={styles.houseIndicator} />
        </Animated.View>
      ))}

      {/* Loading text */}
      <View style={styles.textContainer}>
        <View style={[styles.textBackground, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          <Text style={styles.loadingText}>{getLoadingText()}</Text>
          <Text style={styles.houseCount}>
            Found {houses.length} smart homes
          </Text>
        </View>
      </View>

      {/* Progress dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: Math.floor(progress / 25) === i ? 'white' : 'rgba(255,255,255,0.4)',
                width: Math.floor(progress / 25) === i ? 32 : 8,
              }
            ]}
          />
        ))}
      </View>

      {/* Corner decorations */}
      <View style={[styles.cornerDecoration, styles.topLeft]} />
      <View style={[styles.cornerDecoration, styles.bottomRight]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    zIndex: 1,
  },
  logoContainer: {
    position: 'absolute',
    top: 80,
    alignItems: 'center',
    zIndex: 10,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  outerRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  gradientRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: 'transparent',
  },
  pulseRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  centerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  progressContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressFill: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: 'white',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  progressText: {
    position: 'absolute',
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  house: {
    position: 'absolute',
    zIndex: 5,
  },
  houseBackground: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  houseIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'white',
  },
  textContainer: {
    position: 'absolute',
    bottom: 140,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  textBackground: {
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  houseCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  cornerDecoration: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  topLeft: {
    top: 100,
    left: 16,
    borderTopLeftRadius: 24,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  bottomRight: {
    bottom: 100,
    right: 16,
    borderBottomRightRadius: 24,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
});