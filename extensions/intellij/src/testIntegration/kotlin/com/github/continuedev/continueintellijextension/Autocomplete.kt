package com.github.continuedev.continueintellijextension

import com.automation.remarks.junit5.Video
import com.intellij.driver.sdk.ui.components.*
import com.intellij.driver.sdk.wait
import com.intellij.driver.sdk.waitForIndicators
import com.intellij.ide.starter.driver.engine.runIdeWithDriver
import com.intellij.ide.starter.ide.IdeProductProvider
import com.intellij.ide.starter.models.TestCase
import com.intellij.ide.starter.plugins.PluginConfigurator
import com.intellij.ide.starter.project.NoProject
import com.intellij.ide.starter.runner.Starter
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.awt.event.KeyEvent
import java.io.File
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Duration.Companion.seconds

class Autocomplete {

    @Video
    @Test
    fun testAutocomplete() {
        val starter = Starter.newContext("testExample", TestCase(IdeProductProvider.IC, NoProject).withVersion("2024.3"))
        PluginConfigurator(starter).installPluginFromFolder(File(System.getProperty("CONTINUE_PLUGIN_DIR")))
        starter.runIdeWithDriver().useDriverAndCloseIde {
            welcomeScreen {
                createNewProjectButton.click()
                button("Create").click()
            }

            // New Java projects may trigger an automatic JDK download on clean CI runners.
            // Wait for project setup/background work to finish before sending keyboard input,
            // otherwise the download dialog can steal focus and truncate the trigger text.
            waitForIndicators(5.minutes)

            ideFrame {
                waitForNoOpenedDialogs()

                editorTabs {
                    clickTab("Main.java")
                }
                codeEditor {
                    // Clear any existing text using the IntelliJ Driver keyboard API.
                    keyboard {
                        hotKey(KeyEvent.VK_CONTROL, KeyEvent.VK_A)
                        backspace()
                    }

                    // Type trigger text
                    keyboard {
                        enterText("TEST_USER_MESSAGE_0")
                        space()
                    }

                    // On a cold CI start the Continue core process must boot and load the
                    // test config before it can serve completions. Press Tab to accept the
                    // inline suggestion once it appears; if it was not up yet, Tab inserts
                    // a literal tab which we remove before the next attempt.
                    var found = false
                    var attempts = 0
                    val maxAttempts = 8
                    while (!found && attempts < maxAttempts) {
                        attempts++
                        wait(4.seconds)
                        keyboard {
                            tab()
                        }
                        wait(2.seconds)
                        found = text.contains("TEST_LLM_RESPONSE_0")
                        if (!found) {
                            keyboard {
                                backspace()
                            }
                        }
                    }

                    if (!found) {
                        assertTrue(
                            found,
                            "Autocomplete response never appeared after $maxAttempts attempts. " +
                                "Editor contains: \"$text\". " +
                                "Core binary check: ${coreBinaryCheck()}; " +
                                "core log tail: ${coreLogTail()}; " +
                                "idea log tail: ${ideaLogTail()}"
                        )
                    }
                }
            }
        }
    }

    /**
     * The plugin sandbox must contain the packaged Continue core binary; if the
     * prepareSandbox copy step failed, autocomplete can never work and the test
     * should say so explicitly instead of timing out invisibly.
     */
    private fun coreBinaryCheck(): String {
        return try {
            val pluginDir = File(System.getProperty("CONTINUE_PLUGIN_DIR"))
            val coreDir = File(pluginDir, "core")
            val binary = File(coreDir, "linux-x64/continue-binary")
            when {
                binary.exists() -> "binary OK at ${binary.path}"
                coreDir.exists() ->
                    "binary MISSING; core dir contains: " +
                        coreDir.walkTopDown().take(40).joinToString(", ") { it.relativeTo(pluginDir).path }
                else -> "core dir MISSING entirely under ${pluginDir.path}: " +
                    pluginDir.listFiles()?.joinToString(", ") { it.name }.orEmpty()
            }
        } catch (e: Exception) {
            "error: ${e.message}"
        }
    }

    /**
     * Core writes its log under $CONTINUE_GLOBAL_DIR/logs/core.log (the test task
     * points CONTINUE_GLOBAL_DIR at the checked-in test-continue directory), but
     * some setups fall back to $HOME/.continue/logs/core.log. Its tail usually
     * names the exact failure (config parse error, provider error, wasm abort).
     */
    private fun coreLogTail(): String {
        return try {
            val globalDir = File(
                System.getenv("CONTINUE_GLOBAL_DIR")
                    ?: File(System.getProperty("user.dir"), "src/testIntegration/kotlin/com/github/continuedev/continueintellijextension/test-continue").path
            )
            val candidates = listOf(
                File(globalDir, "logs/core.log"),
                File(System.getProperty("user.home"), ".continue/logs/core.log"),
                File(System.getProperty("user.home"), ".continue/index/logs/core.log"),
            )
            val coreLog = candidates.firstOrNull { it.exists() }
            if (coreLog != null) {
                "${coreLog.path}: " + coreLog.readLines().takeLast(30).joinToString(" | ")
            } else {
                "no core.log in ${candidates.map { it.path }} (global dir: ${globalDir.listFiles()?.joinToString(", ") { it.name }.orEmpty()}; home: ${File(System.getProperty("user.home"), ".continue").listFiles()?.joinToString(", ") { it.name }.orEmpty()})"
            }
        } catch (e: Exception) {
            "error: ${e.message}"
        }
    }

    /**
     * The IDE sandbox idea.log names plugin startup problems (core spawn
     * failures, config errors, extension activation crashes).
     */
    private fun ideaLogTail(): String {
        return try {
            val pluginDir = File(System.getProperty("CONTINUE_PLUGIN_DIR"))
            // Sandbox root is build/idea-sandbox/IC-<version>; idea.log lives under its system/log dir.
            val sandboxRoot = pluginDir.parentFile?.parentFile
            val logDir = sandboxRoot?.resolve("system")?.resolve("log")
                ?: sandboxRoot?.walkTopDown()?.firstOrNull { it.isDirectory && it.name == "log" }
            val ideaLog = logDir?.resolve("idea.log")
            if (ideaLog?.exists() == true) {
                ideaLog.readLines()
                    .filter { it.contains("continue", ignoreCase = true) || it.contains("ERROR", ignoreCase = false) }
                    .takeLast(30)
                    .joinToString(" | ")
            } else {
                "no idea.log under ${sandboxRoot?.path}"
            }
        } catch (e: Exception) {
            "error: ${e.message}"
        }
    }
}
