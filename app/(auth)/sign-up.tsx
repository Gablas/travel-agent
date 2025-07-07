import { useSignUp } from '@clerk/clerk-expo'
import { LinearGradient } from 'expo-linear-gradient'
import { Link, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [pendingVerification, setPendingVerification] = useState(false)
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)

    const onSignUpPress = async () => {
        if (!isLoaded) return

        setLoading(true)
        try {
            await signUp.create({
                emailAddress,
                password,
            })

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
            setPendingVerification(true)
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign up.'
            Alert.alert('Sign Up Error', errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const onVerifyPress = async () => {
        if (!isLoaded) return

        setLoading(true)
        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            })

            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId })
                router.replace('/')
            } else {
                Alert.alert('Verification Failed', 'Please check your code and try again.')
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred during verification.'
            Alert.alert('Verification Error', errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const isSignUpFormValid = emailAddress.trim() && password.trim()
    const isVerificationFormValid = code.trim()

    if (pendingVerification) {
        return (
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Icon name="mark-email-read" size={32} color="#667eea" />
                        </View>
                        <Text style={styles.title}>Check Your Email</Text>
                        <Text style={styles.subtitle}>
                            We've sent a verification code to{'\n'}
                            <Text style={styles.emailHighlight}>{emailAddress}</Text>
                        </Text>
                    </View>

                    {/* Verification Form */}
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Verification Code</Text>
                            <View style={styles.inputWrapper}>
                                <Icon name="verified" size={20} color="#6b7280" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={code}
                                    onChangeText={setCode}
                                    placeholder="Enter 6-digit code"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    autoComplete="one-time-code"
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.verifyButton, !isVerificationFormValid && styles.verifyButtonDisabled]}
                            onPress={onVerifyPress}
                            disabled={!isVerificationFormValid || loading}
                        >
                            <LinearGradient
                                colors={isVerificationFormValid ? ['#667eea', '#764ba2'] : ['#9ca3af', '#9ca3af']}
                                start={[0, 0]}
                                end={[1, 1]}
                                style={styles.gradientButton}
                            >
                                {loading ? (
                                    <View style={styles.loadingContainer}>
                                        <Text style={styles.buttonText}>Verifying...</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.buttonText}>Verify Email</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.backContainer}>
                            <TouchableOpacity onPress={() => setPendingVerification(false)}>
                                <Text style={styles.backText}>← Back to Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Icon name="person-add" size={32} color="#667eea" />
                    </View>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join us and start planning your next adventure</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputWrapper}>
                            <Icon name="email" size={20} color="#6b7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={emailAddress}
                                onChangeText={setEmailAddress}
                                placeholder="Enter your email"
                                placeholderTextColor="#9ca3af"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <Icon name="lock" size={20} color="#6b7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Create a password"
                                placeholderTextColor="#9ca3af"
                                secureTextEntry={!showPassword}
                                autoComplete="password-new"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.passwordToggle}
                            >
                                <Icon
                                    name={showPassword ? 'visibility-off' : 'visibility'}
                                    size={20}
                                    color="#6b7280"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.signUpButton, !isSignUpFormValid && styles.signUpButtonDisabled]}
                        onPress={onSignUpPress}
                        disabled={!isSignUpFormValid || loading}
                    >
                        <LinearGradient
                            colors={isSignUpFormValid ? ['#667eea', '#764ba2'] : ['#9ca3af', '#9ca3af']}
                            start={[0, 0]}
                            end={[1, 1]}
                            style={styles.gradientButton}
                        >
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <Text style={styles.buttonText}>Creating Account...</Text>
                                </View>
                            ) : (
                                <Text style={styles.buttonText}>Create Account</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.signInContainer}>
                        <Text style={styles.signInText}>Already have an account?</Text>
                        <Link href="/sign-in" style={styles.signInLink}>
                            <Text style={styles.signInLinkText}>Sign In</Text>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 48,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#f3f4f6',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_400Regular',
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    emailHighlight: {
        fontFamily: 'PlusJakartaSans_500Medium',
        color: '#111827',
    },
    form: {
        gap: 24,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_500Medium',
        color: '#111827',
        marginBottom: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_400Regular',
        color: '#111827',
        minHeight: 24,
    },
    passwordToggle: {
        padding: 4,
    },
    signUpButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
    },
    signUpButtonDisabled: {
        opacity: 0.6,
    },
    verifyButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
    },
    verifyButtonDisabled: {
        opacity: 0.6,
    },
    gradientButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_700Bold',
        color: '#ffffff',
        textAlign: 'center',
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        marginTop: 24,
    },
    signInText: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_400Regular',
        color: '#6b7280',
    },
    signInLink: {
        padding: 4,
    },
    signInLinkText: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_700Bold',
        color: '#667eea',
    },
    backContainer: {
        alignItems: 'center',
        marginTop: 24,
    },
    backText: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_500Medium',
        color: '#667eea',
        padding: 8,
    },
})