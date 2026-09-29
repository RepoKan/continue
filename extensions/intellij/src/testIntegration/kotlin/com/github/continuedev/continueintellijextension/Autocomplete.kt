package com.github.continuedev.continueintellijextension

import com.automation.remarks.junit5.Video
import com.intellij.driver.sdk.ui.components.*
import com.intellij.driver.sdk.wait
import com.intellij.driver.sdk.waitFor
import com.intellij.driver.sdk.waitForIndicators
import com.intellij.ide.starter.driver.engine.runIdeWithDriver
import com.intellij.ide.starter.ide.IdeProductProvider
import com.intellij.ide.starter.models.TestCase
import com.intellij.ide.starter.plugins.PluginConfigurator
import com.intellij.ide.starter.project.NoProject
import com.intellij.ide.starter.runner.Starter
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

                    // Trigger autocomplete with longer wait for plugin initialization
                    wait(3.seconds)
                    keyboard {
                        tab()
                    }

                    // Poll for the asynchronous completion instead of relying on a fixed delay.
                    waitFor("autocomplete response", 30.seconds) {
                        text.contains("TEST_LLM_RESPONSE_0")
                    }
                }
            }
        }
    }

}
