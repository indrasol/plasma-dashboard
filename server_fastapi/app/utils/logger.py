import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("plasma-dashboard")

def log_info(message: str):
    logger.info(message)

def log_error(message: str):
    logger.error(message)

def log_debugger(message: str):
    logger.debug(message)

