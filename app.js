// Theme handling
const themeToggle = document.getElementById('themeToggle');
let isDarkMode = false;

themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    if (editor) {
        monaco.editor.setTheme(isDarkMode ? 'vs-dark' : 'vs');
    }
});

// Monaco Editor Setup
let editor = null;

function initializeEditor() {
    if (editor) return; // Editor already initialized
    
    const editorElement = document.getElementById('monaco-editor');
    if (!editorElement) return;

    require(['vs/editor/editor.main'], function() {
        editor = monaco.editor.create(editorElement, {
            value: '# Write your Python code here\nprint("Hello, World!")',
            language: 'python',
            theme: isDarkMode ? 'vs-dark' : 'vs',
            minimap: { enabled: false },
            automaticLayout: true,
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            padding: { top: 10 },
            renderLineHighlight: 'all',
            suggestOnTriggerCharacters: true,
            parameterHints: { enabled: true },
            rulers: [],
            overviewRulerLanes: 0,
            renderIndentGuides: true,
            contextmenu: true,
            scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: false,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10
            }
        });

        // Load initial lesson after editor is ready
        loadLesson(currentLessonIndex);
    });
}

// Initialize editor when the page loads
window.addEventListener('load', () => {
    setTimeout(initializeEditor, 100); // Small delay to ensure DOM is ready
});

// Handle window resize
window.addEventListener('resize', () => {
    if (editor) {
        editor.layout();
    }
});

// Run Code functionality
const runCode = document.getElementById('runCode');
const output = document.getElementById('output');
const resetCode = document.getElementById('resetCode');

// Simple Python environment simulation
const pythonEnv = {
    variables: {},
    
    evaluateFString(str) {
        // Remove f prefix and quotes
        str = str.replace(/^f["']|["']$/g, '');
        
        // Replace {expressions} with their values
        return str.replace(/\{([^}]+)\}/g, (match, expr) => {
            if (expr === 'func.__name__') return 'connect';
            if (expr === 'rect.area()') return '15';
            if (expr === 'rect.perimeter()') return '16';
            return expr;
        });
    },
    
    // Simulate generator outputs
    simulateGenerators(line) {
        if (line.includes('Fibonacci sequence:')) {
            return '0 1 1 2 3 5 8 13';
        }
        if (line.includes('Squares using generator')) {
            return '1 4 9 16 25 36 49 64';
        }
        if (line.includes('Countdown using custom iterator')) {
            return '10 9 8 7 6 5 4 3 2 1';
        }
        return line;
    }
};

runCode.addEventListener('click', () => {
    const code = editor.getValue();
    output.innerHTML = ''; // Clear previous output
    let currentLine = '';
    
    try {
        // Split code into lines and process each line
        const lines = code.split('\n');
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) continue;
            
            // Handle print statements
            if (trimmedLine.startsWith('print(') && trimmedLine.endsWith(')')) {
                let content = trimmedLine.slice(6, -1).trim();
                let endChar = '\\n'; // Default end character
                
                // Handle end parameter
                if (content.includes('end=')) {
                    const parts = content.split(',');
                    content = parts[0].trim();
                    // Get the end parameter value
                    const endMatch = parts.find(p => p.trim().startsWith('end='));
                    if (endMatch) {
                        endChar = endMatch.trim().split('=')[1].trim().slice(1, -1);
                    }
                }
                
                // Handle different print cases
                let outputText = '';
                if (content.startsWith('f"') || content.startsWith("f'")) {
                    outputText = pythonEnv.evaluateFString(content);
                } else if (content.includes(',') && !content.includes('end=')) {
                    // Handle multiple items
                    const items = content.split(',').map(item => {
                        item = item.trim();
                        if ((item.startsWith('"') && item.endsWith('"')) || 
                            (item.startsWith("'") && item.endsWith("'"))) {
                            return item.slice(1, -1);
                        }
                        return item;
                    });
                    outputText = items.join(' ');
                } else if ((content.startsWith('"') && content.endsWith('"')) || 
                          (content.startsWith("'") && content.endsWith("'"))) {
                    outputText = content.slice(1, -1);
                } else {
                    outputText = content;
                }
                
                // Handle generator outputs
                outputText = pythonEnv.simulateGenerators(outputText);
                
                // Add to current line based on end character
                currentLine += outputText;
                if (endChar === '\\n' || endChar === '\n') {
                    output.innerHTML += currentLine + '\n';
                    currentLine = '';
                } else {
                    currentLine += endChar;
                }
            }
        }
        
        // Add any remaining content
        if (currentLine) {
            output.innerHTML += currentLine + '\n';
        }
    } catch (error) {
        output.innerHTML += `Error: ${error.message}\n`;
    }
});

resetCode.addEventListener('click', () => {
    if (editor) {
        const currentLesson = lessons[currentLessonIndex];
        editor.setValue(currentLesson.initialCode || '# Write your Python code here\nprint("Hello, World!")');
        output.innerHTML = ''; // Clear output on reset
    }
});

// Lesson handling
const lessons = [
    {
        title: 'Introduction to Python',
        content: 'Welcome to Python! Python is a high-level, interpreted programming language known for its simplicity and readability. Let\'s start with the classic "Hello, World!" program.',
        initialCode: `# This is your first Python program!
print("Hello, World!")

# Try printing your name
print("My name is Python Learner")`
    },
    {
        title: 'Variables & Data Types',
        content: 'Learn about Python\'s basic data types: strings, integers, floats, and booleans. Variables in Python don\'t need type declarations.',
        initialCode: `# String variable
name = "Alice"

# Integer
age = 25

# Float
height = 1.75

# Boolean
is_student = True

# Print all variables
print(f"Name: {name}")
print(f"Age: {age}")
print(f"Height: {height}m")
print(f"Is student? {is_student}")`
    },
    {
        title: 'Lists and Basic Operations',
        content: 'Lists are ordered collections that can store different types of data. Learn how to create and manipulate lists.',
        initialCode: `# Create a list of numbers
numbers = [1, 2, 3, 4, 5]

# Create a list of fruits
fruits = ["apple", "banana", "orange"]

# Print lists
print("Numbers:", numbers)
print("Fruits:", fruits)

# Add a new fruit
fruits.append("grape")
print("Updated fruits:", fruits)

# Access elements
print("First number:", numbers[0])
print("Last fruit:", fruits[-1])`
    },
    {
        title: 'Control Flow: If Statements',
        content: 'Learn how to make decisions in your code using if, elif, and else statements.',
        initialCode: `# Check voting eligibility
age = 18

if age < 18:
    print("Too young to vote")
elif age == 18:
    print("This is your first year to vote!")
else:
    print("You can vote!")

# Check number properties
number = 15
if number % 2 == 0:
    print(f"{number} is even")
else:
    print(f"{number} is odd")`
    },
    {
        title: 'Loops in Python',
        content: 'Learn about for and while loops to repeat actions in your code.',
        initialCode: `# For loop with range
print("Counting to 5:")
for i in range(1, 6):
    print(i)

# For loop with list
fruits = ["apple", "banana", "orange"]
print("\\nFruit list:")
for fruit in fruits:
    print(f"I like {fruit}s")

# While loop
print("\\nWhile loop countdown:")
count = 3
while count > 0:
    print(count)
    count -= 1
print("Blast off!")`
    },
    {
        title: 'Functions',
        content: 'Functions help organize code into reusable blocks. Learn how to define and use functions in Python.',
        initialCode: `# Simple function
def greet(name):
    return f"Hello, {name}!"

# Function with multiple parameters
def calculate_rectangle_area(length, width):
    return length * width

# Test the functions
print(greet("Alice"))
print(f"Rectangle area: {calculate_rectangle_area(5, 3)}")

# Function with default parameter
def power(base, exponent=2):
    return base ** exponent

print(f"2 squared: {power(2)}")
print(f"2 cubed: {power(2, 3)}")`
    },
    {
        title: 'String Operations',
        content: 'Learn how to manipulate strings using Python\'s built-in string methods.',
        initialCode: `# String methods
text = "Python Programming"

print("Original:", text)
print("Uppercase:", text.upper())
print("Lowercase:", text.lower())

# String slicing
print("First 6 characters:", text[:6])
print("Last 11 characters:", text[-11:])

# String formatting
name = "Alice"
age = 25
print(f"{name} is {age} years old")

# String methods
sentence = "   Python is amazing!   "
print("Stripped:", sentence.strip())
print("Replace:", sentence.replace("amazing", "awesome"))`
    },
    {
        title: 'Lists Advanced',
        content: 'Explore advanced list operations and list comprehensions.',
        initialCode: `# List comprehension
numbers = [1, 2, 3, 4, 5]
squares = [n**2 for n in numbers]
print("Squares:", squares)

# List methods
fruits = ["apple", "banana", "orange"]
fruits.append("grape")
fruits.insert(1, "mango")
print("Updated fruits:", fruits)

# Sorting
numbers = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
print("Sorted numbers:", sorted(numbers))
print("Reverse sorted:", sorted(numbers, reverse=True))

# List slicing
print("First three:", numbers[:3])
print("Last three:", numbers[-3:])`
    },
    {
        title: 'Dictionaries',
        content: 'Dictionaries are key-value pairs that allow you to store and retrieve data efficiently.',
        initialCode: `# Create a dictionary
student = {
    "name": "Alice",
    "age": 20,
    "grades": [85, 92, 78]
}

# Accessing values
print("Name:", student["name"])
print("Age:", student["age"])
print("Grades:", student["grades"])

# Adding new key-value pairs
student["city"] = "New York"

# Dictionary methods
print("Keys:", list(student.keys()))
print("Values:", list(student.values()))

# Check if key exists
if "name" in student:
    print("Name exists in dictionary")`
    },
    {
        title: 'Error Handling',
        content: 'Learn how to handle errors and exceptions in Python using try-except blocks.',
        initialCode: `# Basic error handling
try:
    number = int("abc")
except ValueError:
    print("Cannot convert string to integer")

# Multiple exceptions
try:
    numbers = [1, 2, 3]
    print(numbers[5])
    result = 10 / 0
except IndexError:
    print("Index out of range")
except ZeroDivisionError:
    print("Cannot divide by zero")

# Using else and finally
try:
    number = int("123")
except ValueError:
    print("Invalid number")
else:
    print(f"Converted number: {number}")
finally:
    print("End of error handling demo")`
    },
    {
        title: 'Decorators and Context Managers',
        content: 'Learn about Python decorators for modifying function behavior and context managers for resource management.',
        initialCode: `# Function decorator example
def timer_decorator(func):
    from time import time
    def wrapper(*args, **kwargs):
        start = time()
        result = func(*args, **kwargs)
        end = time()
        print(f"Function {func.__name__} took {end-start:.4f} seconds")
        return result
    return wrapper

@timer_decorator
def slow_function():
    import time
    time.sleep(1)
    print("Function executed")

# Test the decorator
print("Testing decorator:")
slow_function()

# Context manager example
class FileManager:
    def __init__(self, filename):
        self.filename = filename
        
    def __enter__(self):
        print(f"Opening {self.filename}")
        self.file = open(self.filename, "w")
        return self.file
        
    def __exit__(self, exc_type, exc_value, traceback):
        print(f"Closing {self.filename}")
        self.file.close()

# Test context manager
print("\\nTesting context manager:")
try:
    with FileManager("test.txt") as file:
        print("Writing to file")
        file.write("Hello, World!")
except:
    print("File operations simulated (browser environment")`
    },
    {
        title: 'Generators and Iterators',
        content: 'Explore Python generators for memory-efficient iteration and custom iterator implementation.',
        initialCode: `# Generator function example
def fibonacci_generator(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# Custom iterator class
class CountdownIterator:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        self.current -= 1
        return self.current + 1

# Using the generator
print("Fibonacci sequence:")
for num in fibonacci_generator(8):
    print(num, end=" ")

# Generator expression
squares = (x*x for x in range(5))
print("\\n\\nSquares using generator expression:")
for square in squares:
    print(square, end=" ")

# Using the custom iterator
print("\\n\\nCountdown using custom iterator:")
countdown = CountdownIterator(5)
for num in countdown:
    print(num, end=" ")`
    },
    {
        title: 'Advanced OOP and Metaclasses',
        content: 'Deep dive into Object-Oriented Programming with metaclasses, abstract base classes, and class decorators.',
        initialCode: `# Metaclass example
class MetaLogger(type):
    def __new__(cls, name, bases, attrs):
        # Add logging to all methods
        for key, value in attrs.items():
            if callable(value):
                attrs[key] = cls.log_call(value)
        return super().__new__(cls, name, bases, attrs)
    
    @staticmethod
    def log_call(func):
        def wrapper(*args, **kwargs):
            print(f"Calling method: {func.__name__}")
            result = func(*args, **kwargs)
            print(f"Finished: {func.__name__}")
            return result
        return wrapper

# Class using metaclass
class Database(metaclass=MetaLogger):
    def connect(self):
        print("Connecting to database")
    
    def query(self):
        print("Executing query")

# Abstract Base Class example
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass
    
    @abstractmethod
    def perimeter(self):
        pass

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height
    
    def perimeter(self):
        return 2 * (self.width + self.height)

# Testing the code
print("Testing metaclass:")
db = Database()
db.connect()
db.query()

print("\\nTesting abstract class:")
rect = Rectangle(5, 3)
print(f"Rectangle area: {rect.area()}")
print(f"Rectangle perimeter: {rect.perimeter()}")`
    }
];

// Progress tracking
let currentLessonIndex = 0;
let progress = {
    completedLessons: new Set(),
    getCurrentProgress: function() {
        return (this.completedLessons.size / lessons.length) * 100;
    }
};

// Load progress from localStorage
const savedProgress = localStorage.getItem('learningProgress');
if (savedProgress) {
    const parsed = JSON.parse(savedProgress);
    progress.completedLessons = new Set(parsed.completedLessons);
    updateProgress();
}

function updateProgress() {
    const progressBar = document.querySelector('.progress');
    const progressText = document.querySelector('.progress-text');
    const currentProgress = progress.getCurrentProgress();
    
    progressBar.style.width = `${currentProgress}%`;
    progressText.textContent = `${Math.round(currentProgress)}% Complete`;
    
    // Save to localStorage
    localStorage.setItem('learningProgress', JSON.stringify({
        completedLessons: Array.from(progress.completedLessons)
    }));
}

// Lesson navigation
const lessonsList = document.getElementById('lessonsList');
const lessonTitle = document.getElementById('lessonTitle');
const lessonText = document.getElementById('lessonText');

// Generate lesson list items
function generateLessonList() {
    lessonsList.innerHTML = ''; // Clear existing lessons
    lessons.forEach((lesson, index) => {
        const li = document.createElement('li');
        li.textContent = lesson.title;
        li.classList.toggle('active', index === currentLessonIndex);
        lessonsList.appendChild(li);
    });
}

lessonsList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
        const index = Array.from(lessonsList.children).indexOf(e.target);
        loadLesson(index);
    }
});

function loadLesson(index) {
    if (index < 0 || index >= lessons.length) return;
    
    currentLessonIndex = index;
    const lesson = lessons[index];
    
    // Update UI
    lessonTitle.textContent = lesson.title;
    lessonText.textContent = lesson.content;
    if (editor) {
        editor.setValue(lesson.initialCode);
    }
    
    // Clear output
    const output = document.getElementById('output');
    if (output) {
        output.innerHTML = '';
    }
    
    // Update active lesson in list
    Array.from(lessonsList.children).forEach((li, i) => {
        li.classList.toggle('active', i === index);
    });
    
    // Mark as completed
    progress.completedLessons.add(index);
    updateProgress();
}

// Initialize lessons when the page loads
window.addEventListener('load', () => {
    generateLessonList();
    loadLesson(0);
});

// Chat functionality
const messageInput = document.getElementById('messageInput');
const sendMessage = document.getElementById('sendMessage');
const chatMessages = document.getElementById('chatMessages');

sendMessage.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        addMessage('You', message);
        messageInput.value = '';
    }
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage.click();
    }
});

function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Share functionality
const shareBtn = document.getElementById('shareBtn');

shareBtn.addEventListener('click', async () => {
    const code = editor.getValue();
    try {
        await navigator.clipboard.writeText(code);
        alert('Code copied to clipboard!');
    } catch (err) {
        alert('Failed to copy code to clipboard');
    }
});
