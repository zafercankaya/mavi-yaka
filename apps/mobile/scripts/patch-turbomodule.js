/**
 * Patches RCTTurboModule.mm to fix iOS 26 crash in performVoidMethodInvocation.
 *
 * React Native PR #55390 fix - async void TurboModule methods throw C++ exceptions
 * on background dispatch queues, which crashes the app with SIGABRT on iOS 26.
 *
 * This patch makes performVoidMethodInvocation handle async exceptions the same way
 * as performMethodInvocation: log instead of throw.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname, '..', 'node_modules', 'react-native',
  'ReactCommon', 'react', 'nativemodule', 'core', 'platform', 'ios', 'ReactCommon',
  'RCTTurboModule.mm'
);

if (!fs.existsSync(filePath)) {
  console.log('[patch-turbomodule] RCTTurboModule.mm not found, skipping (not iOS build)');
  process.exit(0);
}

let content = fs.readFileSync(filePath, 'utf8');

// Check if already patched
if (content.includes('Async void methods cannot rethrow')) {
  console.log('[patch-turbomodule] Already patched, skipping');
  process.exit(0);
}

const OLD = `    @try {
      [inv invokeWithTarget:strongModule];
    } @catch (NSException *exception) {
      throw convertNSExceptionToJSError(runtime, exception, std::string{moduleName}, methodNameStr);
    } @finally {
      [retainedObjectsForInvocation removeAllObjects];
    }

    if (shouldVoidMethodsExecuteSync_) {
      TurboModulePerfLogger::syncMethodCallExecutionEnd(moduleName, methodName);
    } else {
      TurboModulePerfLogger::asyncMethodCallExecutionEnd(moduleName, methodName, asyncCallCounter);
    }`;

const NEW = `    @try {
      [inv invokeWithTarget:strongModule];
    } @catch (NSException *exception) {
      if (shouldVoidMethodsExecuteSync_) {
        // We can only convert NSException to JSError in sync method calls.
        throw convertNSExceptionToJSError(runtime, exception, std::string{moduleName}, methodNameStr);
      } else {
        // Async void methods cannot rethrow C++ exceptions on background queues.
        // Log the error instead of crashing. Fix from react-native PR #55390.
        RCTLogError(@"Exception '%@' was thrown while invoking %s on target %@ with params (void method)",
            exception, methodNameStr.c_str(), strongModule);
        return;
      }
    } @finally {
      [retainedObjectsForInvocation removeAllObjects];
    }

    if (shouldVoidMethodsExecuteSync_) {
      TurboModulePerfLogger::syncMethodCallExecutionEnd(moduleName, methodName);
    } else {
      TurboModulePerfLogger::asyncMethodCallExecutionEnd(moduleName, methodName, asyncCallCounter);
    }`;

if (!content.includes(OLD)) {
  console.error('[patch-turbomodule] ERROR: Could not find target code in RCTTurboModule.mm');
  console.error('[patch-turbomodule] The file may have been updated. Check react-native version.');
  process.exit(1);
}

content = content.replace(OLD, NEW);
fs.writeFileSync(filePath, content);
console.log('[patch-turbomodule] Successfully patched RCTTurboModule.mm (iOS 26 TurboModule crash fix)');
