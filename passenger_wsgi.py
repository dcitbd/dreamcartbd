"""
DREAM CART BD — CPANEL PYTHON PASSENGER WSGI ENTRY POINT (passenger_wsgi.py)
Automatically connects cPanel "Setup Python App" (Phusion Passenger) to app.py.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from app import application
