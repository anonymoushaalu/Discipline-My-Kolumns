import re

def apply_rule(value, rule_type, rule_value):
    """
    Apply validation rule to a value.
    
    Args:
        value: The value to validate
        rule_type: Type of rule ("regex", "range", etc.)
        rule_value: The rule definition
        
    Returns:
        Boolean indicating if value passes the rule
    """
    if rule_type == "regex":
        return bool(re.match(rule_value, str(value)))

    if rule_type == "range":
        try:
            min_val, max_val = rule_value.split("-")
            return int(min_val) <= int(value) <= int(max_val)
        except:
            return False

    return True
