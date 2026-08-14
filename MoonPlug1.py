import ctypes
import tkinter as tk

# ============================================================
# WINDOWS DPI SHARPNESS
# ============================================================

try:
    ctypes.windll.shcore.SetProcessDpiAwareness(1)
except:
    pass


# ============================================================
# WINDOW
# ============================================================

window = tk.Tk()
window.title("Lazarus")
window.geometry("1100x750")
window.minsize(900, 600)
window.configure(bg="#0f0f0f")


# ============================================================
# COLORS
# ============================================================

BG = "#0f0f0f"
SIDEBAR = "#151515"

INPUT_BG = "#202020"
INPUT_HOVER = "#292929"

USER_BUBBLE = "#303030"
AI_BUBBLE = "#202020"

WHITE = "#ffffff"
MUTED = "#9b9b9b"

BUTTON_BG = "#303030"
BUTTON_HOVER = "#414141"


# ============================================================
# SIDEBAR
# ============================================================

sidebar = tk.Frame(
    window,
    bg=SIDEBAR,
    width=270
)

sidebar.pack(
    side="left",
    fill="y"
)

sidebar.pack_propagate(False)


# ============================================================
# Zion LOGO
# ============================================================

logo = tk.Label(
    sidebar,
    text="Lazarus",
    bg=SIDEBAR,
    fg=WHITE,
    font=("Söhne", 19, "bold")
)

logo.pack(
    pady=(25, 25)
)


# ============================================================
# NEW CHAT
# ============================================================

new_chat_button = tk.Button(
    sidebar,
    text="+  New Chat",
    bg=SIDEBAR,
    fg=WHITE,
    activebackground="#252525",
    activeforeground=WHITE,
    relief="flat",
    borderwidth=0,
    font=("Söhne", 12),
    anchor="w",
    padx=20,
    pady=12
)

new_chat_button.pack(
    fill="x",
    padx=10,
    pady=5
)


# ============================================================
# SIDEBAR MODES
# ============================================================

modes = [
    "💬  Chat",
    "📚  Study",
    "💻  Code",
    "🧠  Deep Think",
    "🎨  Creative",
    "💻📚 AI Improve"


]

for mode in modes:

    button = tk.Button(
        sidebar,
        text=mode,
        bg=SIDEBAR,
        fg=WHITE,
        activebackground="#252525",
        activeforeground=WHITE,
        relief="flat",
        borderwidth=0,
        font=("Söhne", 12),
        anchor="w",
        padx=20,
        pady=10
    )

    button.pack(
        fill="x",
        padx=10,
        pady=2
    )


# ============================================================
# MAIN AREA
# ============================================================

main_area = tk.Frame(
    window,
    bg=BG
)

main_area.pack(
    side="left",
    fill="both",
    expand=True
)


# ============================================================
# MESSAGES AREA
# ============================================================

messages_frame = tk.Frame(
    main_area,
    bg=BG
)

messages_frame.pack(
    side="top",
    fill="both",
    expand=True,
    padx=35,
    pady=20
)


# ============================================================
# WELCOME TEXT
# ============================================================

welcome = tk.Label(
    messages_frame,
    text=" Ask anything",
    bg=BG,
    fg=WHITE,
    font=("Söhne", 25, "bold")
)

welcome.place(
    relx=0.5,
    rely=0.45,
    anchor="center"
)


# ============================================================
# ROUNDED RECTANGLE
# ============================================================

def rounded_rectangle(
    canvas,
    x1,
    y1,
    x2,
    y2,
    radius,
    color
):

    canvas.create_arc(
        x1,
        y1,
        x1 + radius * 2,
        y1 + radius * 2,
        start=90,
        extent=90,
        fill=color,
        outline=color
    )

    canvas.create_arc(
        x2 - radius * 2,
        y1,
        x2,
        y1 + radius * 2,
        start=0,
        extent=90,
        fill=color,
        outline=color
    )

    canvas.create_arc(
        x1,
        y2 - radius * 2,
        x1 + radius * 2,
        y2,
        start=180,
        extent=90,
        fill=color,
        outline=color
    )

    canvas.create_arc(
        x2 - radius * 2,
        y2 - radius * 2,
        x2,
        y2,
        start=270,
        extent=90,
        fill=color,
        outline=color
    )

    canvas.create_rectangle(
        x1 + radius,
        y1,
        x2 - radius,
        y2,
        fill=color,
        outline=color
    )

    canvas.create_rectangle(
        x1,
        y1 + radius,
        x2,
        y2 - radius,
        fill=color,
        outline=color
    )


# ============================================================
# CHAT BUBBLES
# ============================================================

def add_bubble(text, sender):

    welcome.place_forget()

    bubble_frame = tk.Frame(
        messages_frame,
        bg=BG
    )

    bubble_frame.pack(
        fill="x",
        pady=7
    )

    if sender == "user":
        bubble_color = USER_BUBBLE
        side = "right"
    else:
        bubble_color = AI_BUBBLE
        side = "left"

    canvas = tk.Canvas(
        bubble_frame,
        bg=BG,
        highlightthickness=0,
        bd=0
    )

    canvas.pack(
        side=side
    )

    text_id = canvas.create_text(
        20,
        15,
        text=text,
        fill=WHITE,
        font=("Söhne", 16),
        anchor="nw",
        width=550
    )

    box = canvas.bbox(text_id)

    text_width = box[2] - box[0]
    text_height = box[3] - box[1]

    padding_x = 20
    padding_y = 15
    radius = 20

    bubble_width = max(
        text_width + padding_x * 2,
        70
    )

    bubble_height = (
        text_height +
        padding_y * 2
    )

    canvas.config(
        width=bubble_width,
        height=bubble_height
    )

    rounded_rectangle(
        canvas,
        0,
        0,
        bubble_width,
        bubble_height,
        radius,
        bubble_color
    )

    canvas.tag_raise(text_id)


# ============================================================
# AI TYPING ANIMATION
# ============================================================

typing_frame = None
typing_label = None

typing_animation_running = False
typing_step = 0


def show_typing():

    global typing_frame
    global typing_label
    global typing_animation_running
    global typing_step

    if typing_animation_running:
        return

    welcome.place_forget()

    typing_animation_running = True
    typing_step = 0

    typing_frame = tk.Frame(
        messages_frame,
        bg=AI_BUBBLE
    )

    typing_frame.pack(
        anchor="w",
        pady=7
    )

    typing_label = tk.Label(
        typing_frame,
        text="AI is typing.",
        bg=AI_BUBBLE,
        fg=MUTED,
        font=("Söhne", 14)
    )

    typing_label.pack(
        padx=18,
        pady=10
    )

    animate_typing()


def animate_typing():

    global typing_step

    if not typing_animation_running:
        return

    dots = "." * ((typing_step % 3) + 1)

    typing_label.config(
        text="AI is typing" + dots
    )

    typing_step += 1

    window.after(
        400,
        animate_typing
    )


def hide_typing():

    global typing_animation_running

    typing_animation_running = False

    if typing_frame is not None:
        typing_frame.destroy()


# ============================================================
# INPUT AREA
# ============================================================

input_area = tk.Frame(
    main_area,
    bg=BG
)

input_area.pack(
    side="bottom",
    fill="x",
    padx=80,
    pady=(10, 35)
)


# ============================================================
# INPUT BACKGROUND
# ============================================================

input_canvas = tk.Canvas(
    input_area,
    height=68,
    bg=BG,
    highlightthickness=0,
    bd=0
)

input_canvas.pack(
    fill="x"
)


def draw_input_bar(event=None):

    input_canvas.delete("input_background")

    width = input_canvas.winfo_width()

    if width < 20:
        return

    rounded_rectangle(
        input_canvas,
        2,
        2,
        width - 2,
        66,
        30,
        INPUT_BG
    )


input_canvas.bind(
    "<Configure>",
    draw_input_bar
)


# ============================================================
# MODE BUTTON
# ============================================================

mode_button = tk.Button(
    input_area,
    text="💬",
    bg=INPUT_BG,
    fg=WHITE,
    activebackground=INPUT_HOVER,
    activeforeground=WHITE,
    relief="flat",
    borderwidth=0,
    font=("Söhne", 15),
    cursor="hand2"
)

mode_button.place(
    x=15,
    y=14,
    width=40,
    height=40
)


# ============================================================
# MESSAGE BOX
# ============================================================

placeholder = "Message Zion..."

message_box = tk.Entry(
    input_area,
    bg=INPUT_BG,
    fg=MUTED,
    insertbackground=WHITE,
    selectbackground="#404040",
    selectforeground=WHITE,
    font=("Söhne", 15),
    relief="flat",
    borderwidth=0
)

message_box.place(
    x=62,
    y=14,
    relwidth=0.70,
    height=40
)

message_box.insert(
    0,
    placeholder
)


def remove_placeholder(event):

    if message_box.get() == placeholder:

        message_box.delete(
            0,
            tk.END
        )

        message_box.config(
            fg=WHITE
        )


def restore_placeholder(event):

    if message_box.get().strip() == "":

        message_box.insert(
            0,
            placeholder
        )

        message_box.config(
            fg=MUTED
        )


message_box.bind(
    "<FocusIn>",
    remove_placeholder
)

message_box.bind(
    "<FocusOut>",
    restore_placeholder
)


# ============================================================
# VOICE BUTTON
# ============================================================

voice_button = tk.Canvas(
    input_area,
    width=44,
    height=44,
    bg=INPUT_BG,
    highlightthickness=0,
    bd=0,
    cursor="hand2"
)

voice_button.place(
    relx=0.86,
    rely=0.5,
    anchor="center"
)


def draw_voice_button(background=BUTTON_BG):

    voice_button.delete("all")

    # Circle

    voice_button.create_oval(
        2,
        2,
        42,
        42,
        fill=background,
        outline=""
    )

    # Microphone body

    voice_button.create_rectangle(
        18,
        10,
        26,
        25,
        fill=WHITE,
        outline=""
    )

    # Top

    voice_button.create_oval(
        18,
        7,
        26,
        15,
        fill=WHITE,
        outline=""
    )

    # Bottom

    voice_button.create_oval(
        18,
        21,
        26,
        29,
        fill=WHITE,
        outline=""
    )

    # Outer microphone curve

    voice_button.create_arc(
        13,
        14,
        31,
        32,
        start=0,
        extent=-180,
        style="arc",
        outline=WHITE,
        width=2
    )

    # Stem

    voice_button.create_line(
        22,
        30,
        22,
        35,
        fill=WHITE,
        width=2
    )

    # Base

    voice_button.create_line(
        17,
        35,
        27,
        35,
        fill=WHITE,
        width=2
    )


draw_voice_button()


def voice_hover(event):

    draw_voice_button(
        BUTTON_HOVER
    )


def voice_leave(event):

    draw_voice_button(
        BUTTON_BG
    )


def voice_clicked(event):

    print("Voice button clicked")


voice_button.bind(
    "<Enter>",
    voice_hover
)

voice_button.bind(
    "<Leave>",
    voice_leave
)

voice_button.bind(
    "<Button-1>",
    voice_clicked
)


# ============================================================
# SEND BUTTON
# ============================================================

send_button = tk.Canvas(
    input_area,
    width=44,
    height=44,
    bg=INPUT_BG,
    highlightthickness=0,
    bd=0,
    cursor="hand2"
)

send_button.place(
    relx=0.94,
    rely=0.5,
    anchor="center"
)


def draw_send_button(background=BUTTON_BG):

    send_button.delete("all")

    # Circle

    send_button.create_oval(
        2,
        2,
        42,
        42,
        fill=background,
        outline=""
    )

    # Arrow

    send_button.create_polygon(
        12,
        22,
        30,
        12,
        25,
        22,
        30,
        32,
        12,
        22,
        fill=WHITE,
        outline=""
    )


draw_send_button()


def send_hover(event):

    draw_send_button(
        BUTTON_HOVER
    )


def send_leave(event):

    draw_send_button(
        BUTTON_BG
    )


send_button.bind(
    "<Enter>",
    send_hover
)

send_button.bind(
    "<Leave>",
    send_leave
)


# ============================================================
# SEND MESSAGE
# ============================================================

def send_message():

    user_message = message_box.get().strip()

    if user_message == "":
        return

    if user_message == placeholder:
        return

    message_box.delete(
        0,
        tk.END
    )

    message_box.config(
        fg=WHITE
    )

    add_bubble(
        user_message,
        "user"
    )


# ============================================================
# SEND BUTTON CLICK
# ============================================================

send_button.bind(
    "<Button-1>",
    lambda event: send_message()
)


# ============================================================
# ENTER KEY
# ============================================================

def enter_pressed(event):

    send_message()

    return "break"


message_box.bind(
    "<Return>",
    enter_pressed
)


# ============================================================
# START
# ============================================================

message_box.focus_set()

window.mainloop()


