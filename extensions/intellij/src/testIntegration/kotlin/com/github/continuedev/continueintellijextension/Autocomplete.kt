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
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.assertTrue
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

                    // Trigger autocomplete and accept the inline suggestion with
                    // Tab. After a cold start on CI the first completion can take
                    // several seconds to arrive; pressing Tab before the suggestion
                    // is shown inserts a literal tab instead of accepting it, so
                    // retry the accept step and only assert at the end.
                    wait(3.seconds)
                    var accepted = false
                    var attempts = 0
                    while (!accepted && attempts < 5) {
                        attempts++
                        keyboard {
                            tab()
                        }
                        wait(2.seconds)

                        if (text.contains("TEST_LLM_RESPONSE_0")) {
                            accepted = true
                        } else {
                            // The suggestion was not accepted; the tab was
                            // likely inserted literally. Remove it and retry.
                            keyboard {
                                backspace()
                            }
                        }
                    }

                    val editorText = text
                    assertTrue(
                        accepted,
                        "Expected autocomplete response not found. Editor contains: $editorText"
                    )
                }
            }
        }
    }

}
